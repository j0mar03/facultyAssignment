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
      const conflicts = [];
      
      // Check conflicts in sections (primary source for calendar)
      // Group by semester and academic year to only check conflicts within the same term
      const sections = await this.sectionRepo.createQueryBuilder('section')
        .leftJoinAndSelect('section.faculty', 'faculty')
        .leftJoinAndSelect('section.course', 'course')
        .where('section.facultyId IS NOT NULL')
        .andWhere('section.isActive = :isActive', { isActive: true })
        .andWhere('section.status = :status', { status: 'Assigned' })
        .getMany();
      
      // Group sections by semester and academic year
      const sectionsByTerm = new Map<string, typeof sections>();
      sections.forEach(section => {
        const key = `${section.semester}-${section.academicYear}`;
        if (!sectionsByTerm.has(key)) {
          sectionsByTerm.set(key, []);
        }
        sectionsByTerm.get(key)!.push(section);
      });
      
      // Check conflicts within each term separately
      for (const [term, termSections] of sectionsByTerm.entries()) {
        // Check faculty time conflicts - only if different sections/courses
        for (let i = 0; i < termSections.length; i++) {
          for (let j = i + 1; j < termSections.length; j++) {
            const s1 = termSections[i];
            const s2 = termSections[j];
            
            // Skip if same section (a section can have multiple time slots, that's not a conflict)
            if (s1.id === s2.id) continue;
            
            // Faculty conflict: Same faculty, different courses/sections, overlapping time
            if (s1.facultyId === s2.facultyId && 
                s1.courseId !== s2.courseId && // Must be different courses
                s1.timeSlots && s2.timeSlots) {
              
              // Check if any time slots overlap
              for (const slot1 of s1.timeSlots) {
                for (const slot2 of s2.timeSlots) {
                  if (slot1.dayOfWeek === slot2.dayOfWeek) {
                    const start1 = this.timeToMinutes(slot1.startTime);
                    const end1 = this.timeToMinutes(slot1.endTime);
                    const start2 = this.timeToMinutes(slot2.startTime);
                    const end2 = this.timeToMinutes(slot2.endTime);
                    
                    // Check for actual time overlap (not just same time)
                    if (start1 < end2 && start2 < end1) {
                      conflicts.push({
                        faculty: s1.faculty?.fullName || `${s1.faculty?.firstName} ${s1.faculty?.lastName}`,
                        course1: s1.course.code,
                        course2: s2.course.code,
                        section1: s1.sectionCode,
                        section2: s2.sectionCode,
                        day: slot1.dayOfWeek,
                        time1: `${slot1.startTime}-${slot1.endTime}`,
                        time2: `${slot2.startTime}-${slot2.endTime}`,
                        type: 'faculty',
                        semester: s1.semester,
                        academicYear: s1.academicYear,
                      });
                    }
                  }
                }
              }
            }
            
            // Room conflict: Same room, different sections, overlapping time
            if (s1.room && s2.room && 
                s1.room.trim() === s2.room.trim() && // Same room (trimmed for comparison)
                s1.id !== s2.id && // Different sections
                s1.timeSlots && s2.timeSlots) {
              
              for (const slot1 of s1.timeSlots) {
                for (const slot2 of s2.timeSlots) {
                  if (slot1.dayOfWeek === slot2.dayOfWeek) {
                    const start1 = this.timeToMinutes(slot1.startTime);
                    const end1 = this.timeToMinutes(slot1.endTime);
                    const start2 = this.timeToMinutes(slot2.startTime);
                    const end2 = this.timeToMinutes(slot2.endTime);
                    
                    // Check for actual time overlap
                    if (start1 < end2 && start2 < end1) {
                      conflicts.push({
                        faculty: `Room: ${s1.room}`,
                        course1: s1.course.code,
                        course2: s2.course.code,
                        section1: s1.sectionCode,
                        section2: s2.sectionCode,
                        room: s1.room,
                        day: slot1.dayOfWeek,
                        time1: `${slot1.startTime}-${slot1.endTime}`,
                        time2: `${slot2.startTime}-${slot2.endTime}`,
                        type: 'room',
                        semester: s1.semester,
                        academicYear: s1.academicYear,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Also check assignments for backward compatibility (only if they're not already covered by sections)
      // Only check assignments that don't have corresponding sections
      const assignments = await this.assignmentRepo.find({
        relations: ['faculty', 'course'],
        where: { status: 'Active' }
      });
      
      // Only check assignments that are in different courses (same logic as sections)
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const a1 = assignments[i];
          const a2 = assignments[j];
          
          // Must be same faculty, different courses, same semester/academic year
          if (a1.facultyId === a2.facultyId && 
              a1.courseId !== a2.courseId &&
              a1.semester === a2.semester &&
              a1.academicYear === a2.academicYear &&
              a1.timeSlot && a2.timeSlot &&
              a1.timeSlot.dayOfWeek === a2.timeSlot.dayOfWeek) {
            
            const start1 = this.timeToMinutes(a1.timeSlot.startTime);
            const end1 = this.timeToMinutes(a1.timeSlot.endTime);
            const start2 = this.timeToMinutes(a2.timeSlot.startTime);
            const end2 = this.timeToMinutes(a2.timeSlot.endTime);
            
            // Check for actual time overlap
            if (start1 < end2 && start2 < end1) {
              conflicts.push({
                faculty: a1.faculty?.fullName || 'Unknown',
                course1: a1.course?.code || 'Unknown',
                course2: a2.course?.code || 'Unknown',
                day: a1.timeSlot.dayOfWeek,
                time1: `${a1.timeSlot.startTime}-${a1.timeSlot.endTime}`,
                time2: `${a2.timeSlot.startTime}-${a2.timeSlot.endTime}`,
                type: 'faculty',
                semester: a1.semester,
                academicYear: a1.academicYear,
              });
            }
          }
        }
      }
      
      // Remove duplicates - conflicts are unique if they have same faculty/room, courses, day, and times
      const uniqueConflicts = conflicts.filter((conflict, index, self) =>
        index === self.findIndex((c) => 
          c.faculty === conflict.faculty &&
          ((c.course1 === conflict.course1 && c.course2 === conflict.course2) ||
           (c.course1 === conflict.course2 && c.course2 === conflict.course1)) &&
          c.day === conflict.day &&
          c.time1 === conflict.time1 &&
          c.time2 === conflict.time2 &&
          c.type === conflict.type
        )
      );
      
      res.json({ conflicts: uniqueConflicts });
    } catch (error) {
      console.error('Conflict check error:', error);
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
    // Use a fixed reference week (current week starting from Monday)
    // This ensures dates don't shift when viewing the calendar
    const today = new Date();
    const currentDay = today.getDay();
    
    // Calculate Monday of current week (day 1 = Monday)
    // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Our system: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days; otherwise go to Monday
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() + mondayOffset);
    mondayOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate target day from Monday (0 = Sunday, 1 = Monday, etc.)
    // Adjust for JavaScript's day numbering (0 = Sunday)
    const jsDayOfWeek = dayOfWeek === 0 ? 0 : dayOfWeek; // Sunday stays 0
    const daysFromMonday = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1; // Sunday is 6 days from Monday
    
    const targetDate = new Date(mondayOfWeek);
    targetDate.setDate(mondayOfWeek.getDate() + daysFromMonday);
    
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
        AdminFaculty: { regular: 0, extra: 15 }, // All load is extra (part-time hours)
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