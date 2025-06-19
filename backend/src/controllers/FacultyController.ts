import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Faculty } from '../entities/Faculty';
import { ITEESRecord } from '../entities/ITEESRecord';
import { Assignment } from '../entities/Assignment';
import { Section } from '../entities/Section';
import { ConstraintService } from '../services/ConstraintService';

export class FacultyController {
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private iteesRepo = AppDataSource.getRepository(ITEESRecord);
  private assignmentRepo = AppDataSource.getRepository(Assignment);
  private sectionRepo = AppDataSource.getRepository(Section);

  getAll = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.find({
        relations: ['iteesHistory'],
        order: { lastName: 'ASC', firstName: 'ASC' },
      });
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.findOne({
        where: { id: req.params.id },
        relations: ['iteesHistory', 'assignments'],
      });
      
      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const faculty = this.facultyRepo.create(req.body);
      const saved = await this.facultyRepo.save(faculty);
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create faculty' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const result = await this.facultyRepo.update(req.params.id, req.body);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      const updated = await this.facultyRepo.findOne({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update faculty' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      
      // Check if faculty exists
      const faculty = await this.facultyRepo.findOne({ where: { id: facultyId } });
      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      // Check for dependencies
      const [assignments, sections, iteesRecords] = await Promise.all([
        this.assignmentRepo.count({ where: { facultyId } }),
        this.sectionRepo.count({ where: { facultyId } }),
        this.iteesRepo.count({ where: { facultyId } })
      ]);

      const dependencies = [];
      if (assignments > 0) dependencies.push(`${assignments} assignment(s)`);
      if (sections > 0) dependencies.push(`${sections} section(s)`);
      if (iteesRecords > 0) dependencies.push(`${iteesRecords} ITEES record(s)`);

      if (dependencies.length > 0) {
        return res.status(409).json({ 
          error: 'Cannot delete faculty member',
          message: `This faculty member is currently assigned to ${dependencies.join(', ')}. Please remove these assignments first or use the force delete option.`,
          dependencies: {
            assignments,
            sections,
            iteesRecords
          }
        });
      }

      // If no dependencies, proceed with deletion
      const result = await this.facultyRepo.delete(facultyId);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete faculty error:', error);
      res.status(400).json({ error: 'Failed to delete faculty' });
    }
  };

  forceDelete = async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      
      // Check if faculty exists
      const faculty = await this.facultyRepo.findOne({ where: { id: facultyId } });
      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      // Delete related records first
      await Promise.all([
        this.assignmentRepo.delete({ facultyId }),
        this.sectionRepo.createQueryBuilder()
          .update()
          .set({ facultyId: () => 'NULL' })
          .where('facultyId = :facultyId', { facultyId })
          .execute(),
        this.iteesRepo.delete({ facultyId })
      ]);

      // Now delete the faculty
      const result = await this.facultyRepo.delete(facultyId);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      
      res.json({ 
        message: 'Faculty member and all related records deleted successfully',
        deletedRecords: {
          faculty: 1,
          assignments: 'All related assignments deleted',
          sections: 'Unassigned from all sections',
          iteesRecords: 'All ITEES records deleted'
        }
      });
    } catch (error: any) {
      console.error('Force delete faculty error:', error);
      res.status(400).json({ error: 'Failed to force delete faculty' });
    }
  };

  getLoadSummary = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.findOne({
        where: { id: req.params.id },
        relations: ['assignments', 'assignments.course'],
      });

      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      const currentAssignments = faculty.assignments.filter(
        a => a.status === 'Active' || a.status === 'Approved'
      );

      // Calculate loads properly based on faculty type
      let regularLoad = 0;
      let extraLoad = 0;

      // Group assignments by course+section to avoid counting duplicate records
      const uniqueAssignments = new Map();
      
      for (const assignment of currentAssignments) {
        const key = `${assignment.courseId}-${assignment.section || 'no-section'}`;
        
        if (!uniqueAssignments.has(key)) {
          uniqueAssignments.set(key, assignment);
        }
      }

      // Calculate loads based on unique assignments only
      for (const assignment of uniqueAssignments.values()) {
        const contactHours = parseInt(String(assignment.contactHours || 0));
        
        if (faculty.type === 'Designee') {
          // Use time-based categorization for designees
          const loadType = ConstraintService.getDesigneeLoadType(assignment.timeSlot);
          if (loadType === 'Regular') {
            regularLoad += contactHours;
          } else {
            extraLoad += contactHours;
          }
        } else {
          // Use assignment type for non-designees
          if (assignment.type === 'Regular') {
            regularLoad += contactHours;
          } else {
            extraLoad += contactHours;
          }
        }
      }

      const summary = {
        facultyId: faculty.id,
        name: faculty.fullName,
        regularLoad,
        extraLoad,
        assignments: currentAssignments.map(a => {
          let effectiveType = a.type;
          
          // For designees, determine effective type based on time slot
          if (faculty.type === 'Designee') {
            effectiveType = ConstraintService.getDesigneeLoadType(a.timeSlot);
          }
          
          return {
            courseCode: a.course.code,
            courseName: a.course.name,
            type: effectiveType,
            creditHours: a.creditHours,
            timeSlot: a.timeSlot,
          };
        }),
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch load summary' });
    }
  };

  getITEESHistory = async (req: Request, res: Response) => {
    try {
      const history = await this.iteesRepo.find({
        where: { facultyId: req.params.id },
        order: { createdAt: 'DESC' },
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ITEES history' });
    }
  };

  addITEESRecord = async (req: Request, res: Response) => {
    try {
      const record = this.iteesRepo.create({
        ...req.body,
        facultyId: req.params.id,
      });
      const saved = await this.iteesRepo.save(record);

      // Update consecutive low ratings count
      await this.updateConsecutiveLowRatings(req.params.id);

      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to add ITEES record' });
    }
  };

  private async updateConsecutiveLowRatings(facultyId: string) {
    const history = await this.iteesRepo.find({
      where: { facultyId },
      order: { createdAt: 'DESC' },
      take: 2,
    });

    const lowRatings = ['Satisfactory', 'Fair', 'Poor'];
    const consecutiveLow = history.filter(r => lowRatings.includes(r.rating)).length;

    await this.facultyRepo.update(facultyId, {
      consecutiveLowRatings: consecutiveLow === 2 ? 2 : 0,
    });
  }

  recalculateAllLoads = async (req: Request, res: Response) => {
    try {
      console.log('Starting load recalculation for all faculty...');
      
      // Get all faculty
      const allFaculty = await this.facultyRepo.find();
      
      // Get all assignments
      const allAssignments = await this.assignmentRepo.find({
        where: { status: 'Active' },
        relations: ['course']
      });

      const results = [];

      for (const faculty of allFaculty) {
        const facultyAssignments = allAssignments.filter(a => a.facultyId === faculty.id);
        
        let regularLoad = 0;
        let extraLoad = 0;

        // Group assignments by course+section to avoid counting duplicate records
        const uniqueAssignments = new Map();
        
        for (const assignment of facultyAssignments) {
          const key = `${assignment.courseId}-${assignment.section || 'no-section'}`;
          
          if (!uniqueAssignments.has(key)) {
            uniqueAssignments.set(key, assignment);
          }
        }

        // Recalculate loads based on unique assignments only
        for (const assignment of uniqueAssignments.values()) {
          const contactHours = parseInt(String(assignment.contactHours || 0));
          
          if (faculty.type === 'Designee') {
            // Use time-based categorization for designees
            const loadType = ConstraintService.getDesigneeLoadType(assignment.timeSlot);
            if (loadType === 'Regular') {
              regularLoad += contactHours;
            } else {
              extraLoad += contactHours;
            }
          } else {
            // Use assignment type for non-designees
            if (assignment.type === 'Regular') {
              regularLoad += contactHours;
            } else {
              extraLoad += contactHours;
            }
          }
        }

        // Update faculty load
        const oldRegular = faculty.currentRegularLoad;
        const oldExtra = faculty.currentExtraLoad;
        
        await this.facultyRepo.update(faculty.id, {
          currentRegularLoad: regularLoad,
          currentExtraLoad: extraLoad
        });

        results.push({
          facultyId: faculty.id,
          name: faculty.fullName,
          type: faculty.type,
          old: { regular: oldRegular, extra: oldExtra },
          new: { regular: regularLoad, extra: extraLoad },
          changed: oldRegular !== regularLoad || oldExtra !== extraLoad
        });

        console.log(`Updated ${faculty.fullName}: ${oldRegular}/${oldExtra} -> ${regularLoad}/${extraLoad}`);
      }

      const changedCount = results.filter(r => r.changed).length;
      
      res.json({
        message: 'Load recalculation completed',
        totalFaculty: allFaculty.length,
        changedCount,
        results
      });
    } catch (error) {
      console.error('Load recalculation error:', error);
      res.status(500).json({ error: 'Failed to recalculate loads' });
    }
  };
}