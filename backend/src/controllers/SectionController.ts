import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Section } from '../entities/Section';
import { Course } from '../entities/Course';
import { Faculty } from '../entities/Faculty';
import { Assignment } from '../entities/Assignment';
import { ConstraintService } from '../services/ConstraintService';

export class SectionController {
  private sectionRepo = AppDataSource.getRepository(Section);
  private courseRepo = AppDataSource.getRepository(Course);
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private assignmentRepo = AppDataSource.getRepository(Assignment);

  // Get all sections with filters
  getAllSections = async (req: Request, res: Response) => {
    try {
      const { 
        semester, 
        academicYear, 
        courseId, 
        facultyId, 
        status, 
        unassigned,
        hasConflicts,
        sectionCode
      } = req.query;

      let query = this.sectionRepo.createQueryBuilder('section')
        .leftJoinAndSelect('section.course', 'course')
        .leftJoinAndSelect('section.faculty', 'faculty')
        .where('section.isActive = :isActive', { isActive: true });

      if (semester) {
        query = query.andWhere('section.semester = :semester', { semester });
      }

      if (academicYear) {
        query = query.andWhere('section.academicYear = :academicYear', { academicYear });
      }

      if (courseId) {
        query = query.andWhere('section.courseId = :courseId', { courseId });
      }

      if (facultyId) {
        query = query.andWhere('section.facultyId = :facultyId', { facultyId });
      }

      if (status) {
        query = query.andWhere('section.status = :status', { status });
      }

      if (unassigned === 'true') {
        query = query.andWhere('section.facultyId IS NULL');
      }

      if (sectionCode) {
        query = query.andWhere('section.sectionCode = :sectionCode', { sectionCode });
      }

      const sections = await query.getMany();

      // Add conflict detection if requested
      let sectionsWithConflicts = sections;
      if (hasConflicts === 'true') {
        sectionsWithConflicts = await this.detectConflicts(sections);
      }

      res.json(sectionsWithConflicts);
    } catch (error) {
      console.error('Get sections error:', error);
      res.status(500).json({ error: 'Failed to fetch sections' });
    }
  };

  // Get section by ID
  getSectionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const section = await this.sectionRepo.findOne({
        where: { id },
        relations: ['course', 'faculty']
      });

      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      res.json(section);
    } catch (error) {
      console.error('Get section error:', error);
      res.status(500).json({ error: 'Failed to fetch section' });
    }
  };

  // Create new section
  createSection = async (req: Request, res: Response) => {
    try {
      const {
        sectionCode,
        courseId,
        facultyId,
        status,
        classType,
        semester,
        academicYear,
        maxStudents,
        enrolledStudents,
        room,
        timeSlots,
        isNightSection,
        notes
      } = req.body;

      // Validate course exists
      const course = await this.courseRepo.findOne({ where: { id: courseId } });
      if (!course) {
        return res.status(400).json({ error: 'Course not found' });
      }

      // Validate faculty exists if provided
      if (facultyId) {
        const faculty = await this.facultyRepo.findOne({ where: { id: facultyId } });
        if (!faculty) {
          return res.status(400).json({ error: 'Faculty not found' });
        }
      }

      // Check for duplicate section code within the same course and semester
      const existingSection = await this.sectionRepo.findOne({
        where: {
          sectionCode,
          courseId,
          semester,
          academicYear,
          isActive: true
        }
      });

      if (existingSection) {
        return res.status(400).json({ 
          error: 'Section code already exists for this course and semester' 
        });
      }

      // Check for scheduling conflicts if timeSlots and faculty are provided
      if (facultyId && timeSlots && timeSlots.length > 0) {
        const conflicts = await this.checkScheduleConflicts(facultyId, timeSlots, semester, academicYear);
        if (conflicts.length > 0) {
          return res.status(400).json({ 
            error: 'Schedule conflicts detected',
            conflicts: conflicts 
          });
        }
      }

      const section = this.sectionRepo.create({
        sectionCode,
        courseId,
        facultyId,
        status: status || 'Planning',
        classType: classType || 'Regular',
        semester,
        academicYear,
        maxStudents: maxStudents || 30,
        enrolledStudents: enrolledStudents || 0,
        room,
        timeSlots,
        isNightSection: isNightSection || false,
        notes
      });

      const savedSection = await this.sectionRepo.save(section);
      
      // Fetch the complete section with relations
      const completeSection = await this.sectionRepo.findOne({
        where: { id: savedSection.id },
        relations: ['course', 'faculty']
      });

      res.status(201).json(completeSection);
    } catch (error) {
      console.error('Create section error:', error);
      res.status(500).json({ error: 'Failed to create section' });
    }
  };

  // Update section
  updateSection = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('Update section request:', { id, updateData });

      const section = await this.sectionRepo.findOne({ where: { id } });
      if (!section) {
        console.log('Section not found:', id);
        return res.status(404).json({ error: 'Section not found' });
      }

      console.log('Found section:', section);

      // Validate faculty if being updated
      if (updateData.facultyId) {
        console.log('Validating faculty:', updateData.facultyId);
        const faculty = await this.facultyRepo.findOne({ where: { id: updateData.facultyId } });
        if (!faculty) {
          console.log('Faculty not found:', updateData.facultyId);
          return res.status(400).json({ error: 'Faculty not found' });
        }

        // Check for conflicts if timeSlots are being updated
        const timeSlots = updateData.timeSlots || section.timeSlots;
        if (timeSlots && timeSlots.length > 0) {
          console.log('Checking schedule conflicts for timeSlots:', timeSlots);
          const conflicts = await this.checkScheduleConflicts(
            updateData.facultyId, 
            timeSlots, 
            section.semester, 
            section.academicYear,
            id // Exclude current section from conflict check
          );
          if (conflicts.length > 0) {
            console.log('Schedule conflicts found:', conflicts);
            return res.status(400).json({ 
              error: 'Schedule conflicts detected',
              conflicts: conflicts 
            });
          }
        }
      }

      console.log('Updating section with data:', updateData);
      await this.sectionRepo.update(id, updateData);
      
      console.log('Fetching updated section...');
      const updatedSection = await this.sectionRepo.findOne({
        where: { id },
        relations: ['course', 'faculty']
      });

      console.log('Updated section:', updatedSection);
      res.json(updatedSection);
    } catch (error: any) {
      console.error('Update section error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to update section' });
    }
  };

  // Delete section
  deleteSection = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const section = await this.sectionRepo.findOne({ where: { id } });
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      // Check if section has active assignments
      const activeAssignments = await this.assignmentRepo.count({
        where: { sectionId: id, status: 'Active' }
      });

      if (activeAssignments > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete section with active assignments' 
        });
      }

      // Soft delete by setting isActive to false
      await this.sectionRepo.update(id, { isActive: false });

      res.json({ message: 'Section deleted successfully' });
    } catch (error) {
      console.error('Delete section error:', error);
      res.status(500).json({ error: 'Failed to delete section' });
    }
  };

  // Get sections overview for chairperson dashboard
  getSectionsOverview = async (req: Request, res: Response) => {
    try {
      const { semester, academicYear } = req.query;

      let whereClause: any = { isActive: true };
      if (semester) whereClause.semester = semester;
      if (academicYear) whereClause.academicYear = academicYear;

      const sections = await this.sectionRepo.find({
        where: whereClause,
        relations: ['course', 'faculty']
      });

      const totalSections = sections.length;
      const assignedSections = sections.filter(s => s.facultyId).length;
      const unassignedSections = totalSections - assignedSections;
      const nightSections = sections.filter(s => s.isNightSection).length;
      const assignedNightSections = sections.filter(s => s.isNightSection && s.facultyId).length;

      // Group by course
      const courseGrouping = sections.reduce((acc, section) => {
        const courseCode = section.course.code;
        if (!acc[courseCode]) {
          acc[courseCode] = {
            courseId: section.course.id,
            courseName: section.course.name,
            totalSections: 0,
            assignedSections: 0,
            sections: []
          };
        }
        acc[courseCode].totalSections++;
        if (section.facultyId) acc[courseCode].assignedSections++;
        acc[courseCode].sections.push({
          id: section.id,
          sectionCode: section.sectionCode,
          faculty: section.faculty?.fullName || null,
          status: section.status,
          enrolledStudents: section.enrolledStudents,
          maxStudents: section.maxStudents,
          isNightSection: section.isNightSection
        });
        return acc;
      }, {} as any);

      // Detect conflicts
      const conflictingSections = await this.detectConflicts(sections);
      const conflictCount = conflictingSections.filter((s: any) => s.hasConflicts).length;

      res.json({
        summary: {
          totalSections,
          assignedSections,
          unassignedSections,
          nightSections,
          assignedNightSections,
          conflictCount,
          assignmentRate: totalSections > 0 ? Math.round((assignedSections / totalSections) * 100) : 0,
          nightAssignmentRate: nightSections > 0 ? Math.round((assignedNightSections / nightSections) * 100) : 0
        },
        courseGrouping,
        unassignedSections: sections.filter(s => !s.facultyId).map(s => ({
          id: s.id,
          sectionCode: s.sectionCode,
          courseName: s.course.name,
          courseCode: s.course.code,
          isNightSection: s.isNightSection,
          enrolledStudents: s.enrolledStudents,
          maxStudents: s.maxStudents
        }))
      });
    } catch (error) {
      console.error('Get sections overview error:', error);
      res.status(500).json({ error: 'Failed to fetch sections overview' });
    }
  };

  // Check for schedule conflicts
  private async checkScheduleConflicts(
    facultyId: string, 
    timeSlots: any[], 
    semester: string, 
    academicYear: string,
    excludeSectionId?: string
  ) {
    const conflicts = [];

    // Get all existing sections for this faculty in the same semester
    let query = this.sectionRepo.createQueryBuilder('section')
      .leftJoinAndSelect('section.course', 'course')
      .where('section.facultyId = :facultyId', { facultyId })
      .andWhere('section.semester = :semester', { semester })
      .andWhere('section.academicYear = :academicYear', { academicYear })
      .andWhere('section.isActive = :isActive', { isActive: true });

    if (excludeSectionId) {
      query = query.andWhere('section.id != :excludeSectionId', { excludeSectionId });
    }

    const existingSections = await query.getMany();

    for (const newSlot of timeSlots) {
      for (const existingSection of existingSections) {
        if (existingSection.timeSlots) {
          for (const existingSlot of existingSection.timeSlots) {
            if (this.timeSlotsOverlap(newSlot, existingSlot)) {
              conflicts.push({
                conflictingSection: existingSection.sectionCode,
                conflictingCourse: existingSection.course.name,
                conflictingTime: `${existingSlot.startTime}-${existingSlot.endTime}`,
                dayOfWeek: existingSlot.dayOfWeek
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  // Check if two time slots overlap
  private timeSlotsOverlap(slot1: any, slot2: any): boolean {
    if (slot1.dayOfWeek !== slot2.dayOfWeek) return false;

    const start1 = this.timeToMinutes(slot1.startTime);
    const end1 = this.timeToMinutes(slot1.endTime);
    const start2 = this.timeToMinutes(slot2.startTime);
    const end2 = this.timeToMinutes(slot2.endTime);

    return start1 < end2 && end1 > start2;
  }

  // Convert time string to minutes
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Detect conflicts for multiple sections
  private async detectConflicts(sections: Section[]): Promise<any[]> {
    const sectionsWithConflicts = [];

    for (const section of sections) {
      let hasConflicts = false;
      const conflicts = [];

      if (section.facultyId && section.timeSlots) {
        const conflictResults = await this.checkScheduleConflicts(
          section.facultyId,
          section.timeSlots,
          section.semester,
          section.academicYear,
          section.id
        );
        if (conflictResults.length > 0) {
          hasConflicts = true;
          conflicts.push(...conflictResults);
        }
      }

      sectionsWithConflicts.push({
        ...section,
        hasConflicts,
        conflicts
      });
    }

    return sectionsWithConflicts;
  }

  // Assign faculty to section directly
  assignFacultyToSection = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;
      const { facultyId, room } = req.body;

      const section = await this.sectionRepo.findOne({
        where: { id: sectionId },
        relations: ['course']
      });

      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      // Validate faculty exists
      const faculty = await this.facultyRepo.findOne({ where: { id: facultyId } });
      if (!faculty) {
        return res.status(400).json({ error: 'Faculty not found' });
      }

      // Check for scheduling conflicts if timeSlots exist
      if (section.timeSlots && section.timeSlots.length > 0) {
        const conflicts = await this.checkScheduleConflicts(
          facultyId,
          section.timeSlots,
          section.semester,
          section.academicYear,
          sectionId
        );
        if (conflicts.length > 0) {
          return res.status(400).json({
            error: 'Schedule conflicts detected',
            conflicts: conflicts
          });
        }
      }

      // Update section with faculty assignment and room
      section.facultyId = facultyId;
      section.status = 'Assigned';
      if (room) {
        section.room = room;
      }

      const updatedSection = await this.sectionRepo.save(section);

      // Update faculty load
      const courseCredits = parseInt(String(section.course.credits || 0));
      const contactHours = parseInt(String(section.course.contactHours || 0));
      
      // Determine load type based on faculty type and time slot
      let loadType: 'Regular' | 'Extra' = 'Regular';
      
      if (faculty.type === 'Designee' && section.timeSlots && section.timeSlots.length > 0) {
        // For designees, use time-based load categorization
        const timeSlotLoadType = ConstraintService.getDesigneeLoadType(section.timeSlots[0]);
        loadType = timeSlotLoadType as 'Regular' | 'Extra';
      } else {
        // For non-designees, use simplified logic
        const isExtraLoad = faculty.currentRegularLoad >= 21;
        loadType = isExtraLoad ? 'Extra' : 'Regular';
      }
      
      if (loadType === 'Extra') {
        faculty.currentExtraLoad = parseInt(String(faculty.currentExtraLoad)) + contactHours;
      } else {
        faculty.currentRegularLoad = parseInt(String(faculty.currentRegularLoad)) + contactHours;
      }
      
      await this.facultyRepo.save(faculty);

      // Create or update corresponding Assignment record
      let assignment = await this.assignmentRepo.findOne({
        where: {
          facultyId: facultyId,
          courseId: section.courseId,
          semester: section.semester,
          academicYear: section.academicYear,
          sectionId: sectionId
        }
      });

      if (!assignment) {
        // Create new assignment
        assignment = this.assignmentRepo.create({
          facultyId: facultyId,
          courseId: section.courseId,
          sectionId: sectionId,
          type: loadType,
          status: 'Active',
          timeSlot: section.timeSlots && section.timeSlots.length > 0 ? {
            dayOfWeek: section.timeSlots[0].dayOfWeek,
            startTime: section.timeSlots[0].startTime,
            endTime: section.timeSlots[0].endTime
          } : {
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '11:00'
          },
          semester: section.semester,
          academicYear: section.academicYear,
          section: section.sectionCode,
          room: section.room,
          creditHours: courseCredits,
          contactHours: contactHours,
          approvedBy: 'System',
          approvedAt: new Date().toISOString(),
          notes: `Auto-created from section assignment`
        });
      } else {
        // Update existing assignment
        assignment.type = loadType;
        assignment.status = 'Active';
        assignment.room = section.room || '';
        assignment.sectionId = sectionId;
        if (section.timeSlots && section.timeSlots.length > 0) {
          assignment.timeSlot = {
            dayOfWeek: section.timeSlots[0].dayOfWeek,
            startTime: section.timeSlots[0].startTime,
            endTime: section.timeSlots[0].endTime
          };
        }
      }

      await this.assignmentRepo.save(assignment);

      // Return the updated section with faculty info
      const completeSection = await this.sectionRepo.findOne({
        where: { id: sectionId },
        relations: ['course', 'faculty']
      });

      res.json({
        success: true,
        message: 'Faculty assigned successfully',
        section: completeSection
      });

    } catch (error) {
      console.error('Assign faculty error:', error);
      res.status(500).json({ error: 'Failed to assign faculty to section' });
    }
  };

  // Unassign faculty from section
  unassignFacultyFromSection = async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params;

      const section = await this.sectionRepo.findOne({
        where: { id: sectionId },
        relations: ['course', 'faculty']
      });

      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }

      if (!section.facultyId) {
        return res.status(400).json({ error: 'Section is not assigned to any faculty' });
      }

      // Update faculty load (subtract the hours)
      if (section.faculty) {
        const contactHours = parseInt(String(section.course.contactHours || 0));
        
        // Determine what type of load this was based on faculty type and time slot
        let wasExtraLoad = false;
        
        if (section.faculty.type === 'Designee' && section.timeSlots && section.timeSlots.length > 0) {
          // For designees, check if this was part-time or Saturday (extra load)
          const timeSlotLoadType = ConstraintService.getDesigneeLoadType(section.timeSlots[0]);
          wasExtraLoad = timeSlotLoadType === 'Extra';
        } else {
          // For non-designees, check current load distribution
          const currentExtraLoad = parseInt(String(section.faculty.currentExtraLoad));
          wasExtraLoad = currentExtraLoad >= contactHours;
        }
        
        if (wasExtraLoad) {
          const currentExtraLoad = parseInt(String(section.faculty.currentExtraLoad));
          section.faculty.currentExtraLoad = currentExtraLoad - contactHours;
        } else {
          const currentRegularLoad = parseInt(String(section.faculty.currentRegularLoad));
          section.faculty.currentRegularLoad = currentRegularLoad - contactHours;
        }
        
        await this.facultyRepo.save(section.faculty);
      }

      // Find and update/remove corresponding Assignment record
      const assignment = await this.assignmentRepo.findOne({
        where: {
          facultyId: section.facultyId,
          courseId: section.courseId,
          semester: section.semester,
          academicYear: section.academicYear,
          sectionId: sectionId
        }
      });

      if (assignment) {
        // Update assignment status to completed instead of deleting
        assignment.status = 'Completed';
        assignment.notes = (assignment.notes || '') + ' | Unassigned from section';
        await this.assignmentRepo.save(assignment);
      }

      // Clear faculty assignment
      section.facultyId = undefined;
      section.status = 'Planning';

      const updatedSection = await this.sectionRepo.save(section);

      res.json({
        success: true,
        message: 'Faculty unassigned successfully',
        section: updatedSection
      });

    } catch (error) {
      console.error('Unassign faculty error:', error);
      res.status(500).json({ error: 'Failed to unassign faculty from section' });
    }
  };
}