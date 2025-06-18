import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';
import { TimeSlot, LoadType } from '../types';
import { ConstraintService } from './ConstraintService';

interface SchedulingResult {
  success: boolean;
  assignments?: Assignment[];
  unassignedCourses?: Course[];
  conflicts?: string[];
}

export class SchedulingService {
  static async generateOptimalSchedule(
    faculty: Faculty[],
    courses: Course[],
    existingAssignments: Assignment[],
    semester: string,
    academicYear: string
  ): Promise<SchedulingResult> {
    const assignments: Assignment[] = [];
    const unassignedCourses: Course[] = [];
    const conflicts: string[] = [];

    // Sort courses by priority (night classes first, then by credits)
    const sortedCourses = [...courses].sort((a, b) => {
      if (a.requiresNightSection && !b.requiresNightSection) return -1;
      if (!a.requiresNightSection && b.requiresNightSection) return 1;
      return b.credits - a.credits;
    });

    // Sort faculty by availability and performance
    const sortedFaculty = [...faculty].sort((a, b) => {
      const aLoad = a.currentRegularLoad + a.currentExtraLoad;
      const bLoad = b.currentRegularLoad + b.currentExtraLoad;
      return aLoad - bLoad;
    });

    for (const course of sortedCourses) {
      let assigned = false;

      for (const facultyMember of sortedFaculty) {
        // Try to find a suitable time slot
        const timeSlot = this.findBestTimeSlot(
          facultyMember,
          course,
          [...existingAssignments, ...assignments]
        );

        if (!timeSlot) continue;

        // Determine load type
        const loadType = this.determineLoadType(facultyMember, course);

        // Check constraints
        const canAssign = ConstraintService.canAssignLoad(
          facultyMember,
          course,
          loadType,
          timeSlot,
          [...existingAssignments, ...assignments]
        );

        if (canAssign.valid) {
          const assignment = new Assignment();
          assignment.facultyId = facultyMember.id;
          assignment.faculty = facultyMember;
          assignment.courseId = course.id;
          assignment.course = course;
          assignment.type = loadType;
          assignment.timeSlot = timeSlot;
          assignment.semester = semester;
          assignment.academicYear = academicYear;
          assignment.creditHours = course.credits;
          assignment.contactHours = course.contactHours;
          assignment.status = 'Proposed';

          assignments.push(assignment);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        unassignedCourses.push(course);
        conflicts.push(`Could not assign ${course.code} - ${course.name}`);
      }
    }

    return {
      success: unassignedCourses.length === 0,
      assignments,
      unassignedCourses,
      conflicts,
    };
  }

  private static findBestTimeSlot(
    faculty: Faculty,
    course: Course,
    existingAssignments: Assignment[]
  ): TimeSlot | null {
    // Generate possible time slots
    const possibleSlots = this.generatePossibleTimeSlots(course);

    // Filter by faculty preferences
    if (faculty.preferences && faculty.preferences.length > 0) {
      possibleSlots.sort((a, b) => {
        const aPref = faculty.preferences.find(
          p => p.dayOfWeek === a.dayOfWeek &&
          this.isTimeOverlap(p.startTime, p.endTime, a.startTime, a.endTime)
        );
        const bPref = faculty.preferences.find(
          p => p.dayOfWeek === b.dayOfWeek &&
          this.isTimeOverlap(p.startTime, p.endTime, b.startTime, b.endTime)
        );

        if (aPref && !bPref) return -1;
        if (!aPref && bPref) return 1;
        if (aPref && bPref) {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 };
          return priorityOrder[aPref.priority] - priorityOrder[bPref.priority];
        }
        return 0;
      });
    }

    // Find first available slot
    for (const slot of possibleSlots) {
      const hasConflict = existingAssignments.some(assignment => {
        if (assignment.facultyId !== faculty.id) return false;
        if (assignment.status === 'Completed') return false;
        
        const existingSlot = assignment.timeSlot;
        if (existingSlot.dayOfWeek !== slot.dayOfWeek) return false;

        return this.isTimeOverlap(
          existingSlot.startTime,
          existingSlot.endTime,
          slot.startTime,
          slot.endTime
        );
      });

      if (!hasConflict) {
        return slot;
      }
    }

    return null;
  }

  private static generatePossibleTimeSlots(course: Course): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
    const weekends = [0, 6]; // Sunday and Saturday

    if (course.preferredTimeSlots && course.preferredTimeSlots.length > 0) {
      return course.preferredTimeSlots;
    }

    // Generate standard time slots
    const standardTimes = [
      { start: '07:30', end: '09:00' },
      { start: '09:00', end: '10:30' },
      { start: '10:30', end: '12:00' },
      { start: '13:00', end: '14:30' },
      { start: '14:30', end: '16:00' },
      { start: '16:30', end: '18:00' },
      { start: '18:00', end: '19:30' },
      { start: '19:30', end: '21:00' },
    ];

    // For night classes, only use evening slots
    if (course.requiresNightSection) {
      const nightTimes = standardTimes.filter(t => parseInt(t.start.split(':')[0]) >= 16.5);
      for (const day of weekdays) {
        for (const time of nightTimes) {
          slots.push({
            dayOfWeek: day,
            startTime: time.start,
            endTime: time.end,
          });
        }
      }
    } else {
      // Regular classes can use all time slots
      for (const day of [...weekdays, ...weekends]) {
        for (const time of standardTimes) {
          slots.push({
            dayOfWeek: day,
            startTime: time.start,
            endTime: time.end,
          });
        }
      }
    }

    return slots;
  }

  private static determineLoadType(faculty: Faculty, course: Course): LoadType {
    const currentLoad = faculty.currentRegularLoad;
    const loadLimit = ConstraintService.getMaxLoadForFaculty(faculty);

    if (currentLoad + course.credits <= loadLimit.regular) {
      return 'Regular';
    }
    return 'Extra';
  }

  private static isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}