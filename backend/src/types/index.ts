export type FacultyType = 'Regular' | 'PartTime' | 'Temporary' | 'Designee' | 'AdminFaculty';
export type ITEESRating = 'Outstanding' | 'Very Satisfactory' | 'Satisfactory' | 'Fair' | 'Poor';
export type LoadType = 'Regular' | 'Extra' | 'OJT' | 'Seminar';
export type AssignmentStatus = 'Proposed' | 'Approved' | 'Active' | 'Completed';

export interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface LoadConstraint {
  facultyType: FacultyType;
  iteesRating: ITEESRating;
  consecutiveLowRatings: number;
  maxRegularHours: number;
  maxExtraHours: number;
  allowedTimeSlots: TimeSlot[];
}

export interface SchedulePreference {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  priority: 'High' | 'Medium' | 'Low';
}