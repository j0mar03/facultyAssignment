import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Assignment } from '../entities/Assignment';
import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Section } from '../entities/Section';
import { ConstraintService } from '../services/ConstraintService';

export class AssignmentController {
  private assignmentRepo = AppDataSource.getRepository(Assignment);
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private courseRepo = AppDataSource.getRepository(Course);
  private sectionRepo = AppDataSource.getRepository(Section);

  getAll = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        relations: ['faculty', 'course', 'sectionEntity'],
        order: {
          createdAt: 'DESC'
        }
      });
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const assignment = await this.assignmentRepo.findOne({
        where: { id: req.params.id },
        relations: ['faculty', 'course', 'sectionEntity'],
      });
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;
      
      // Check if there's a matching section for this assignment
      if (assignmentData.section) {
        const matchingSection = await this.sectionRepo.findOne({
          where: {
            sectionCode: assignmentData.section,
            courseId: assignmentData.courseId,
            semester: assignmentData.semester,
            academicYear: assignmentData.academicYear
          }
        });
        
        if (matchingSection) {
          assignmentData.sectionId = matchingSection.id;
          
          // Also update the section with faculty assignment if not already assigned
          if (!matchingSection.facultyId && assignmentData.facultyId) {
            matchingSection.facultyId = assignmentData.facultyId;
            matchingSection.status = 'Assigned';
            if (assignmentData.room) {
              matchingSection.room = assignmentData.room;
            }
            await this.sectionRepo.save(matchingSection);
            
            // Update faculty load
            const faculty = await this.facultyRepo.findOne({ where: { id: assignmentData.facultyId } });
            if (faculty) {
              const contactHours = parseInt(String(assignmentData.contactHours || 0));
              const isExtraLoad = assignmentData.type === 'Extra';
              
              if (isExtraLoad) {
                faculty.currentExtraLoad = parseInt(String(faculty.currentExtraLoad)) + contactHours;
              } else {
                faculty.currentRegularLoad = parseInt(String(faculty.currentRegularLoad)) + contactHours;
              }
              
              await this.facultyRepo.save(faculty);
            }
          }
        }
      }
      
      const assignment = this.assignmentRepo.create(assignmentData);
      const saved = await this.assignmentRepo.save(assignment);
      
      // Ensure saved is a single entity, not an array
      const savedEntity = Array.isArray(saved) ? saved[0] : saved;
      
      // Return with relations
      const completeAssignment = await this.assignmentRepo.findOne({
        where: { id: savedEntity.id },
        relations: ['faculty', 'course', 'sectionEntity']
      });
      
      res.status(201).json(completeAssignment);
    } catch (error) {
      console.error('Assignment creation error:', error);
      res.status(400).json({ error: 'Failed to create assignment' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const result = await this.assignmentRepo.update(req.params.id, req.body);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      const updated = await this.assignmentRepo.findOne({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update assignment' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.assignmentRepo.delete(req.params.id);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete assignment' });
    }
  };

  approve = async (req: Request, res: Response) => {
    try {
      const assignment = await this.assignmentRepo.findOne({
        where: { id: req.params.id },
      });
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      assignment.status = 'Approved';
      assignment.approvedBy = req.body.approvedBy;
      assignment.approvedAt = new Date();
      
      const saved = await this.assignmentRepo.save(assignment);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to approve assignment' });
    }
  };

  getByFaculty = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        where: { facultyId: req.params.facultyId },
        relations: ['course'],
      });
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty assignments' });
    }
  };

  getByCourse = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        where: { courseId: req.params.courseId },
        relations: ['faculty'],
      });
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course assignments' });
    }
  };

  validateAssignment = async (req: Request, res: Response) => {
    try {
      const { facultyId, courseId, type, timeSlot } = req.body;
      console.log('Validating assignment:', { facultyId, courseId, type, timeSlot });
      
      const faculty = await this.facultyRepo.findOne({
        where: { id: facultyId },
        relations: ['iteesHistory'],
      });
      
      const course = await this.courseRepo.findOne({
        where: { id: courseId },
      });
      
      console.log('Found faculty:', faculty ? `${faculty.firstName} ${faculty.lastName}` : 'null');
      console.log('Found course:', course ? `${course.code} - ${course.name}` : 'null');
      
      if (!faculty || !course) {
        console.log('Faculty or course not found');
        return res.status(400).json({ 
          valid: false, 
          errors: ['Faculty or course not found'] 
        });
      }
      
      const existingAssignments = await this.assignmentRepo.find({
        where: { facultyId },
      });
      
      console.log('Existing assignments count:', existingAssignments.length);
      
      const validation = ConstraintService.canAssignLoad(
        faculty,
        course,
        type,
        timeSlot,
        existingAssignments
      );
      
      console.log('Validation result:', validation);
      
      // Format response to match frontend expectations
      if (validation.valid) {
        res.json({ valid: true });
      } else {
        res.json({ 
          valid: false, 
          errors: [validation.reason || 'Unknown validation error'] 
        });
      }
    } catch (error) {
      console.error('Assignment validation error:', error);
      res.status(500).json({ 
        valid: false, 
        errors: ['Failed to validate assignment due to server error'] 
      });
    }
  };
}