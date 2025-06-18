import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';
import { FacultyType, LoadType, TimeSlot, ITEESRating } from '../types';
import { isWithinInterval, parseISO, setHours, setMinutes } from 'date-fns';

export class ConstraintService {
  private static readonly LOAD_LIMITS = {
    Regular: { regular: 21, extra: 9 },
    PartTime: { regular: 12, extra: 0 },
    Temporary: { regular: 21, extra: 9 },
    Designee: { regular: 18, extra: 6 },
  };

  private static readonly ITEES_LOAD_MATRIX = {
    Outstanding: 1.0,
    'Very Satisfactory': 1.0,
    Satisfactory: 0.75,
    Fair: 0.5,
    Poor: 0.25,
  };

  static canAssignLoad(
    faculty: Faculty,
    course: Course,
    loadType: LoadType,
    timeSlot: TimeSlot,
    existingAssignments: Assignment[]
  ): { valid: boolean; reason?: string } {
    // Check ITEES restrictions
    if (faculty.consecutiveLowRatings >= 2 && loadType === 'Extra') {
      return {
        valid: false,
        reason: 'Faculty has 2+ consecutive satisfactory or lower ratings. Cannot assign extra load.',
      };
    }

    // Check load limits
    const loadLimits = this.LOAD_LIMITS[faculty.type];
    const currentLoad = this.calculateCurrentLoad(faculty, existingAssignments);

    if (loadType === 'Regular' && currentLoad.regular + course.credits > loadLimits.regular) {
      return {
        valid: false,
        reason: `Regular load limit exceeded. Current: ${currentLoad.regular}, Limit: ${loadLimits.regular}`,
      };
    }

    if (loadType === 'Extra' && currentLoad.extra + course.credits > loadLimits.extra) {
      return {
        valid: false,
        reason: `Extra load limit exceeded. Current: ${currentLoad.extra}, Limit: ${loadLimits.extra}`,
      };
    }

    // Check time slot constraints
    const timeSlotValid = this.isTimeSlotValid(faculty, loadType, timeSlot);
    if (!timeSlotValid.valid) {
      return timeSlotValid;
    }

    // Check for conflicts
    const hasConflict = this.hasScheduleConflict(timeSlot, existingAssignments);
    if (hasConflict) {
      return {
        valid: false,
        reason: 'Schedule conflict detected with existing assignments.',
      };
    }

    // Check night class requirements
    if (course.requiresNightSection && !this.isNightTimeSlot(timeSlot)) {
      return {
        valid: false,
        reason: 'Course requires night section (4:30 PM - 9:00 PM).',
      };
    }

    return { valid: true };
  }

  private static calculateCurrentLoad(
    faculty: Faculty,
    assignments: Assignment[]
  ): { regular: number; extra: number } {
    const facultyAssignments = assignments.filter(a => a.facultyId === faculty.id && a.status !== 'Completed');
    
    return facultyAssignments.reduce(
      (acc, assignment) => {
        if (assignment.type === 'Regular') {
          acc.regular += assignment.creditHours;
        } else if (assignment.type === 'Extra') {
          acc.extra += assignment.creditHours;
        }
        return acc;
      },
      { regular: 0, extra: 0 }
    );
  }

  private static isTimeSlotValid(
    faculty: Faculty,
    loadType: LoadType,
    timeSlot: TimeSlot
  ): { valid: boolean; reason?: string } {
    const startHour = parseInt(timeSlot.startTime.split(':')[0]);
    const endHour = parseInt(timeSlot.endTime.split(':')[0]);

    // Weekend classes allowed 7:30 AM - 9:00 PM
    if (timeSlot.dayOfWeek === 0 || timeSlot.dayOfWeek === 6) {
      if (startHour < 7.5 || endHour > 21) {
        return {
          valid: false,
          reason: 'Weekend classes must be between 7:30 AM and 9:00 PM.',
        };
      }
      return { valid: true };
    }

    // Weekday regular load: 7:30 AM - 9:00 PM
    if (loadType === 'Regular') {
      if (startHour < 7.5 || endHour > 21) {
        return {
          valid: false,
          reason: 'Regular load must be between 7:30 AM and 9:00 PM.',
        };
      }
    }

    // Weekday extra load: Must include 4:30 PM - 9:00 PM slot
    if (loadType === 'Extra') {
      if (startHour < 16.5 || endHour > 21) {
        return {
          valid: false,
          reason: 'Extra load must be within 4:30 PM - 9:00 PM on weekdays.',
        };
      }
    }

    return { valid: true };
  }

  private static hasScheduleConflict(
    newTimeSlot: TimeSlot,
    existingAssignments: Assignment[]
  ): boolean {
    return existingAssignments.some(assignment => {
      if (assignment.status === 'Completed') return false;
      
      const existingSlot = assignment.timeSlot;
      if (existingSlot.dayOfWeek !== newTimeSlot.dayOfWeek) return false;

      const newStart = this.timeToMinutes(newTimeSlot.startTime);
      const newEnd = this.timeToMinutes(newTimeSlot.endTime);
      const existingStart = this.timeToMinutes(existingSlot.startTime);
      const existingEnd = this.timeToMinutes(existingSlot.endTime);

      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  private static isNightTimeSlot(timeSlot: TimeSlot): boolean {
    const startHour = parseInt(timeSlot.startTime.split(':')[0]);
    const endHour = parseInt(timeSlot.endTime.split(':')[0]);
    return startHour >= 16.5 && endHour <= 21;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static getMaxLoadForFaculty(faculty: Faculty): { regular: number; extra: number } {
    const baseLimit = this.LOAD_LIMITS[faculty.type];
    const latestRating = faculty.latestITEESRating;
    
    if (!latestRating) return baseLimit;

    const multiplier = this.ITEES_LOAD_MATRIX[latestRating];
    return {
      regular: Math.floor(baseLimit.regular * multiplier),
      extra: Math.floor(baseLimit.extra * multiplier),
    };
  }
}