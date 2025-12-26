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
    Designee: { regular: 9, extra: 6 },
    AdminFaculty: { regular: 0, extra: 15 }, // All load is extra (part-time hours)
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
    // For designees, determine the actual load type based on time slot
    let actualLoadType = loadType;
    if (faculty.type === 'Designee') {
      actualLoadType = this.determineDesigneeLoadType(timeSlot);
    }
    
    // Admin Faculty: All load is considered extra (part-time hours)
    if (faculty.type === 'AdminFaculty') {
      actualLoadType = 'Extra';
    }

    // Check ITEES restrictions
    if (faculty.consecutiveLowRatings >= 2 && actualLoadType === 'Extra') {
      return {
        valid: false,
        reason: 'Faculty has 2+ consecutive satisfactory or lower ratings. Cannot assign extra load.',
      };
    }

    // Check load limits
    const loadLimits = this.LOAD_LIMITS[faculty.type];
    const currentLoad = this.calculateCurrentLoad(faculty, existingAssignments);

    if (actualLoadType === 'Regular' && currentLoad.regular + course.contactHours > loadLimits.regular) {
      return {
        valid: false,
        reason: `Regular load limit exceeded. Current: ${currentLoad.regular}, Limit: ${loadLimits.regular}`,
      };
    }

    if (actualLoadType === 'Extra' && currentLoad.extra + course.contactHours > loadLimits.extra) {
      return {
        valid: false,
        reason: `Extra load limit exceeded. Current: ${currentLoad.extra}, Limit: ${loadLimits.extra}`,
      };
    }

    // Check time slot constraints
    const timeSlotValid = this.isTimeSlotValid(faculty, actualLoadType, timeSlot);
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
    
    // Group assignments by course+section to avoid counting duplicate records
    const uniqueAssignments = new Map();
    
    for (const assignment of facultyAssignments) {
      const key = `${assignment.courseId}-${assignment.section || 'no-section'}`;
      
      if (!uniqueAssignments.has(key)) {
        uniqueAssignments.set(key, assignment);
      }
    }

    // Calculate load based on unique assignments only
    return Array.from(uniqueAssignments.values()).reduce(
      (acc, assignment) => {
        // Admin Faculty: All load is extra (part-time hours)
        if (faculty.type === 'AdminFaculty') {
          acc.extra += assignment.contactHours;
        }
        // For designees, determine load type based on time slot
        else if (faculty.type === 'Designee') {
          const loadType = this.determineDesigneeLoadType(assignment.timeSlot);
          if (loadType === 'Regular') {
            acc.regular += assignment.contactHours;
          } else if (loadType === 'Extra') {
            acc.extra += assignment.contactHours;
          }
        } else {
          // For non-designees, use the assignment type
          if (assignment.type === 'Regular') {
            acc.regular += assignment.contactHours;
          } else if (assignment.type === 'Extra') {
            acc.extra += assignment.contactHours;
          }
        }
        return acc;
      },
      { regular: 0, extra: 0 }
    );
  }

  /**
   * Determine load type for designee faculty based on time slot
   * - 9am-6pm = regular hours
   * - 7:30am-9am and 6pm-9pm = part-time hours (counted as extra)
   * - Saturday = temporary substitution (counted as extra)
   */
  private static determineDesigneeLoadType(timeSlot: TimeSlot): LoadType {
    const startHour = this.timeToDecimalHours(timeSlot.startTime);
    const endHour = this.timeToDecimalHours(timeSlot.endTime);
    const dayOfWeek = timeSlot.dayOfWeek;

    // Saturday classes = temporary substitution (extra load)
    if (dayOfWeek === 6) {
      return 'Extra';
    }

    // Check if time falls within regular hours (9am-6pm)
    const isWithinRegularHours = startHour >= 9.0 && endHour <= 18.0;
    
    if (isWithinRegularHours) {
      return 'Regular';
    }

    // Check if time falls within part-time hours (7:30am-9am or 6pm-9pm)
    const isEarlyPartTime = startHour >= 7.5 && endHour <= 9.0;
    const isEveningPartTime = startHour >= 18.0 && endHour <= 21.0;
    
    if (isEarlyPartTime || isEveningPartTime) {
      return 'Extra'; // Part-time hours counted as extra load
    }

    // Default to regular if doesn't fit other categories
    return 'Regular';
  }

  private static isTimeSlotValid(
    faculty: Faculty,
    loadType: LoadType,
    timeSlot: TimeSlot
  ): { valid: boolean; reason?: string } {
    const startHour = this.timeToDecimalHours(timeSlot.startTime);
    const endHour = this.timeToDecimalHours(timeSlot.endTime);

    // Admin Faculty special rules
    if (faculty.type === 'AdminFaculty') {
      // Saturday: 7:30 AM - 9:00 PM allowed
      if (timeSlot.dayOfWeek === 6) {
        if (startHour < 7.5 || endHour > 21) {
          return {
            valid: false,
            reason: 'Admin Faculty Saturday classes must be between 7:30 AM and 9:00 PM.',
          };
        }
        return { valid: true };
      }

      // Sunday: Not allowed (admin rest day)
      if (timeSlot.dayOfWeek === 0) {
        return {
          valid: false,
          reason: 'Admin Faculty cannot be scheduled on Sundays.',
        };
      }

      // Weekdays (Monday-Friday): Only 6:00 PM - 9:00 PM allowed
      // Block 8:00 AM - 5:00 PM (admin hours)
      if (timeSlot.dayOfWeek >= 1 && timeSlot.dayOfWeek <= 5) {
        // Check if overlaps with blocked admin hours (8am-5pm)
        const adminStartHour = 8.0;
        const adminEndHour = 17.0;
        
        // Check if time slot overlaps with admin hours
        if ((startHour < adminEndHour && endHour > adminStartHour)) {
          return {
            valid: false,
            reason: 'Admin Faculty cannot be scheduled during admin hours (8:00 AM - 5:00 PM) on weekdays.',
          };
        }

        // Only allow 6:00 PM - 9:00 PM on weekdays
        if (startHour < 18.0 || endHour > 21.0) {
          return {
            valid: false,
            reason: 'Admin Faculty weekday classes must be between 6:00 PM and 9:00 PM.',
          };
        }

        return { valid: true };
      }
    }

    // Weekend classes allowed 7:30 AM - 9:00 PM (for non-admin faculty)
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
    const startHour = this.timeToDecimalHours(timeSlot.startTime);
    const endHour = this.timeToDecimalHours(timeSlot.endTime);
    return startHour >= 16.5 && endHour <= 21;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert time string (HH:MM) to decimal hours (e.g., "07:30" -> 7.5)
   */
  private static timeToDecimalHours(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
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

  /**
   * Public method to determine load type for designee faculty based on time slot
   * Used by controllers when creating assignments
   */
  static getDesigneeLoadType(timeSlot: TimeSlot): LoadType {
    return this.determineDesigneeLoadType(timeSlot);
  }
}