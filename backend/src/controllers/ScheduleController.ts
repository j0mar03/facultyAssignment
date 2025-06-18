import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';
import { Section } from '../entities/Section';
import { SchedulingService } from '../services/SchedulingService';

export class ScheduleController {
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private courseRepo = AppDataSource.getRepository(Course);
  private assignmentRepo = AppDataSource.getRepository(Assignment);
  private sectionRepo = AppDataSource.getRepository(Section);

  getCalendar = async (req: Request, res: Response) => {
    try {
      // Get all assigned sections with faculty and course information
      const sections = await this.sectionRepo.createQueryBuilder('section')
        .leftJoinAndSelect('section.faculty', 'faculty')
        .leftJoinAndSelect('section.course', 'course')
        .where('section.status = :status', { status: 'Assigned' })
        .andWhere('section.isActive = :isActive', { isActive: true })
        .andWhere('section.facultyId IS NOT NULL')
        .getMany();
      
      const events: any[] = [];
      
      sections.forEach(section => {
        if (section.timeSlots && section.timeSlots.length > 0 && section.faculty) {
          section.timeSlots.forEach(timeSlot => {
            const event = {
              id: `section-${section.id}-${timeSlot.dayOfWeek}-${timeSlot.startTime}`,
              facultyId: section.facultyId,
              facultyName: section.faculty?.firstName + ' ' + section.faculty?.lastName,
              courseId: section.courseId,
              courseCode: section.course.code,
              courseName: section.course.name,
              type: this.getSectionType(section),
              room: section.room,
              section: section.sectionCode,
              sectionId: section.id,
              start: this.getEventDateTime(timeSlot.dayOfWeek, timeSlot.startTime),
              end: this.getEventDateTime(timeSlot.dayOfWeek, timeSlot.endTime),
              title: `${section.course.code} (${section.sectionCode}) - ${section.faculty?.firstName} ${section.faculty?.lastName}`,
              backgroundColor: this.getEventColor(this.getSectionType(section)),
              extendedProps: {
                sectionCode: section.sectionCode,
                isNightSection: section.isNightSection,
                enrolledStudents: section.enrolledStudents,
                maxStudents: section.maxStudents,
                classType: section.classType
              }
            };
            events.push(event);
          });
        }
      });
      
      res.json(events);
    } catch (error) {
      console.error('Calendar error:', error);
      res.status(500).json({ error: 'Failed to fetch calendar data' });
    }
  };

  private getEventColor(type: string): string {
    const colors = {
      Regular: '#1976d2',
      Extra: '#ff9800', 
      OJT: '#4caf50',
      Seminar: '#9c27b0',
    };
    return colors[type as keyof typeof colors] || '#757575';
  }

  generateSchedule = async (req: Request, res: Response) => {
    try {
      const { semester, academicYear } = req.body;
      
      const faculty = await this.facultyRepo.find({
        where: { isActive: true },
        relations: ['iteesHistory'],
      });
      
      const courses = await this.courseRepo.find({
        where: { semester, academicYear, isActive: true },
      });
      
      const existingAssignments = await this.assignmentRepo.find({
        where: { semester, academicYear },
      });
      
      const result = await SchedulingService.generateOptimalSchedule(
        faculty,
        courses,
        existingAssignments,
        semester,
        academicYear
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate schedule' });
    }
  };

  checkConflicts = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        relations: ['faculty', 'course'],
      });
      
      const conflicts = [];
      
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const a1 = assignments[i];
          const a2 = assignments[j];
          
          if (a1.facultyId === a2.facultyId &&
              a1.timeSlot.dayOfWeek === a2.timeSlot.dayOfWeek) {
            // Check time overlap
            const start1 = this.timeToMinutes(a1.timeSlot.startTime);
            const end1 = this.timeToMinutes(a1.timeSlot.endTime);
            const start2 = this.timeToMinutes(a2.timeSlot.startTime);
            const end2 = this.timeToMinutes(a2.timeSlot.endTime);
            
            if (start1 < end2 && start2 < end1) {
              conflicts.push({
                faculty: a1.faculty.fullName,
                course1: a1.course.code,
                course2: a2.course.code,
                day: a1.timeSlot.dayOfWeek,
                time1: `${a1.timeSlot.startTime}-${a1.timeSlot.endTime}`,
                time2: `${a2.timeSlot.startTime}-${a2.timeSlot.endTime}`,
              });
            }
          }
        }
      }
      
      res.json({ conflicts });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check conflicts' });
    }
  };

  optimizeSchedule = async (req: Request, res: Response) => {
    try {
      // Implementation for schedule optimization
      res.json({ message: 'Schedule optimization feature coming soon' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize schedule' });
    }
  };

  getFacultyCalendar = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        where: { facultyId: req.params.facultyId },
        relations: ['course'],
      });
      
      const events = assignments.map(assignment => ({
        id: assignment.id,
        facultyId: assignment.facultyId,
        facultyName: assignment.faculty?.fullName,
        courseId: assignment.courseId,
        courseCode: assignment.course.code,
        type: assignment.type,
        room: assignment.room,
        start: this.getEventDateTime(assignment.timeSlot.dayOfWeek, assignment.timeSlot.startTime),
        end: this.getEventDateTime(assignment.timeSlot.dayOfWeek, assignment.timeSlot.endTime),
      }));
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty calendar' });
    }
  };

  getRoomCalendar = async (req: Request, res: Response) => {
    try {
      const assignments = await this.assignmentRepo.find({
        where: { room: req.params.room },
        relations: ['faculty', 'course'],
      });
      
      const events = assignments.map(assignment => ({
        id: assignment.id,
        facultyName: assignment.faculty.fullName,
        courseCode: assignment.course.code,
        type: assignment.type,
        start: this.getEventDateTime(assignment.timeSlot.dayOfWeek, assignment.timeSlot.startTime),
        end: this.getEventDateTime(assignment.timeSlot.dayOfWeek, assignment.timeSlot.endTime),
      }));
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch room calendar' });
    }
  };

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private getEventDateTime(dayOfWeek: number, time: string): string {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    const [hours, minutes] = time.split(':').map(Number);
    targetDate.setHours(hours, minutes, 0, 0);
    
    return targetDate.toISOString();
  }

  private getSectionType(section: Section): string {
    // Determine if this section represents Regular or Extra load
    // This is a simplified logic - in a real system, you might need to
    // check the faculty's current load against their limits
    if (section.faculty) {
      const faculty = section.faculty;
      const currentRegularLoad = parseInt(String(faculty.currentRegularLoad || 0));
      
      // Faculty type load limits
      const loadLimits = {
        Regular: { regular: 21, extra: 9 },
        PartTime: { regular: 12, extra: 0 },
        Temporary: { regular: 21, extra: 9 },
        Designee: { regular: 18, extra: 6 },
      };
      
      const limits = loadLimits[faculty.type as keyof typeof loadLimits] || { regular: 21, extra: 9 };
      
      // If faculty has already reached their regular load limit, 
      // additional sections would be considered Extra load
      if (currentRegularLoad >= limits.regular) {
        return 'Extra';
      }
    }
    
    // For now, all sections are treated as Regular load
    // In the future, you could implement logic to determine if a section
    // should be considered Extra load based on various factors
    return 'Regular';
  }
}