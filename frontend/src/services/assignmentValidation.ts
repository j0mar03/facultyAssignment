import { facultyService } from './facultyService';
import { sectionService } from './sectionService';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface Faculty {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  type: 'Regular' | 'Part-Time' | 'Temporary' | 'Designee' | 'AdminFaculty';
  department: string;
  college: string;
  currentRegularLoad: number;
  currentExtraLoad: number;
  maxRegularLoad: number;
  maxExtraLoad: number;
  hasITEESRestriction: boolean;
  isActive: boolean;
}

interface Section {
  id: string;
  sectionCode: string;
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  faculty?: {
    id: string;
    fullName: string;
  };
  timeSlots?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  isNightSection: boolean;
  classType: 'Regular' | 'Laboratory' | 'Lecture' | 'Combined';
}

interface AssignmentData {
  facultyId: string;
  sectionId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

class AssignmentValidationService {
  // Load limits based on faculty type
  private getFacultyLoadLimits(facultyType: string) {
    switch (facultyType) {
      case 'Regular':
        return { maxRegular: 21, maxExtra: 9 };
      case 'Part-Time':
        return { maxRegular: 12, maxExtra: 0 };
      case 'Temporary':
        return { maxRegular: 21, maxExtra: 9 };
      case 'Designee':
        return { maxRegular: 9, maxExtra: 6 };
      case 'AdminFaculty':
        return { maxRegular: 0, maxExtra: 15 }; // All load is extra (part-time hours)
      default:
        return { maxRegular: 0, maxExtra: 0 };
    }
  }

  // Check if time is considered night section (after 6 PM)
  private isNightTime(startTime: string): boolean {
    const hour = parseInt(startTime.split(':')[0]);
    return hour >= 18; // 6 PM or later
  }

  // Calculate hours from time slots
  private calculateHours(startTime: string, endTime: string): number {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  // Check for time slot conflicts
  private async checkTimeConflicts(facultyId: string, dayOfWeek: number, startTime: string, endTime: string): Promise<Section[]> {
    try {
      // Get all sections assigned to this faculty
      const facultySections = await sectionService.getAllSections({ facultyId });
      
      // Check for overlapping time slots
      const conflicts = facultySections.filter(section => {
        if (!section.timeSlots) return false;
        
        return section.timeSlots.some(timeSlot => {
          if (timeSlot.dayOfWeek !== dayOfWeek) return false;
          
          // Check time overlap
          const existingStart = new Date(`1970-01-01T${timeSlot.startTime}:00`);
          const existingEnd = new Date(`1970-01-01T${timeSlot.endTime}:00`);
          const newStart = new Date(`1970-01-01T${startTime}:00`);
          const newEnd = new Date(`1970-01-01T${endTime}:00`);
          
          // Check if times overlap
          return (newStart < existingEnd) && (newEnd > existingStart);
        });
      });
      
      return conflicts;
    } catch (error) {
      console.error('Error checking time conflicts:', error);
      return [];
    }
  }

  // Check faculty load capacity
  private checkLoadCapacity(faculty: Faculty, additionalHours: number, isNightSection: boolean): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const limits = this.getFacultyLoadLimits(faculty.type);
    
    // Check ITEES restriction for extra load
    if (faculty.hasITEESRestriction && isNightSection) {
      errors.push('Faculty has ITEES restriction and cannot take extra load assignments');
    }
    
    // Determine if this is regular or extra load based on time and current load
    const isExtraLoad = isNightSection || (faculty.currentRegularLoad + additionalHours > limits.maxRegular);
    
    if (isExtraLoad) {
      // Check extra load capacity
      if (faculty.currentExtraLoad + additionalHours > limits.maxExtra) {
        errors.push(`Faculty extra load capacity exceeded. Current: ${faculty.currentExtraLoad}h, Max: ${limits.maxExtra}h, Adding: ${additionalHours}h`);
      } else if (faculty.currentExtraLoad + additionalHours > limits.maxExtra * 0.8) {
        warnings.push(`Faculty approaching extra load limit (${faculty.currentExtraLoad + additionalHours}/${limits.maxExtra} hours)`);
      }
    } else {
      // Check regular load capacity
      if (faculty.currentRegularLoad + additionalHours > limits.maxRegular) {
        errors.push(`Faculty regular load capacity exceeded. Current: ${faculty.currentRegularLoad}h, Max: ${limits.maxRegular}h, Adding: ${additionalHours}h`);
      } else if (faculty.currentRegularLoad + additionalHours > limits.maxRegular * 0.8) {
        warnings.push(`Faculty approaching regular load limit (${faculty.currentRegularLoad + additionalHours}/${limits.maxRegular} hours)`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Main validation function
  async validateFacultyAssignment(facultyId: string, section: Section): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Get faculty details
      const faculty = await facultyService.getFacultyById(facultyId);
      
      if (!faculty.isActive) {
        errors.push('Faculty member is not active');
      }
      
      if (!section.timeSlots || section.timeSlots.length === 0) {
        errors.push('Section has no time slots defined');
        return { isValid: false, errors, warnings };
      }
      
      // Check each time slot
      for (const timeSlot of section.timeSlots) {
        // Check for scheduling conflicts
        const conflicts = await this.checkTimeConflicts(
          facultyId, 
          timeSlot.dayOfWeek, 
          timeSlot.startTime, 
          timeSlot.endTime
        );
        
        if (conflicts.length > 0) {
          errors.push(`Schedule conflict detected: Faculty already assigned to ${conflicts[0].course.code} at this time`);
        }
        
        // Calculate hours for this time slot
        const hours = this.calculateHours(timeSlot.startTime, timeSlot.endTime);
        const isNightTime = this.isNightTime(timeSlot.startTime);
        
        // Check load capacity
        const loadResult = this.checkLoadCapacity(faculty, hours, isNightTime);
        errors.push(...loadResult.errors);
        warnings.push(...loadResult.warnings);
      }
      
      // Specialization check (warning only)
      if (section.course.code.startsWith('MATH') && !faculty.department.toLowerCase().includes('math')) {
        warnings.push('Faculty specialization may not match course requirements');
      }
      
      // Night class requirement check
      if (section.isNightSection && faculty.type === 'Part-Time') {
        warnings.push('Part-time faculty assigned to night section - verify availability');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
      
    } catch (error) {
      console.error('Error validating faculty assignment:', error);
      return {
        isValid: false,
        errors: ['Failed to validate assignment - please try again'],
        warnings: []
      };
    }
  }

  // Quick validation for drag and drop (less detailed, faster)
  async quickValidate(facultyId: string, sectionId: string): Promise<boolean> {
    try {
      const [faculty, section] = await Promise.all([
        facultyService.getFacultyById(facultyId),
        sectionService.getSectionById(sectionId)
      ]);
      
      // Basic checks
      if (!faculty.isActive) return false;
      if (section.faculty) return false; // Already assigned
      if (!section.timeSlots || section.timeSlots.length === 0) return false;
      
      // Check if faculty has capacity (simplified)
      const limits = this.getFacultyLoadLimits(faculty.type);
      const totalCurrentLoad = faculty.currentRegularLoad + faculty.currentExtraLoad;
      const maxTotalLoad = limits.maxRegular + limits.maxExtra;
      
      // Assume 3 hours per section (average)
      return totalCurrentLoad + 3 <= maxTotalLoad;
      
    } catch (error) {
      console.error('Error in quick validation:', error);
      return false;
    }
  }
}

export const assignmentValidation = new AssignmentValidationService();
export type { ValidationResult, Faculty, Section, AssignmentData };