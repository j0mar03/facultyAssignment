import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { Section } from '../entities/Section';
import { Faculty } from '../entities/Faculty';

interface NewCourseData {
  code: string;
  name: string;
  lecHours: number;
  labHours: number;
  totalHours: number;
  units: number;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
}

// New DCPET 1-3 schedule data for First semester 2025-2026
const newScheduleData: NewCourseData[] = [
  {
    code: 'PATHFIT 1',
    name: 'Physical Activity Towards Health and Fitness 1',
    lecHours: 2,
    labHours: 0,
    totalHours: 2,
    units: 2,
    room: 'OpnCourtPE',
    day: 'T',
    startTime: '11:00 AM',
    endTime: '1:00 PM'
  },
  {
    code: 'CHEM 015',
    name: 'Chemistry for Engineers',
    lecHours: 3,
    labHours: 3,
    totalHours: 6,
    units: 4,
    room: 'ITECH 213',
    day: 'T',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    code: 'CHEM 015',
    name: 'Chemistry for Engineers',
    lecHours: 3,
    labHours: 3,
    totalHours: 6,
    units: 4,
    room: 'ITECH 213',
    day: 'F',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    code: 'CMPE 102',
    name: 'Programming Logic and Design',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 204',
    day: 'M',
    startTime: '10:30 AM',
    endTime: '1:30 PM'
  },
  {
    code: 'ENSC 013',
    name: 'Engineering Drawing',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 213',
    day: 'S',
    startTime: '10:30 AM',
    endTime: '1:30 PM'
  },
  {
    code: 'CPET 102',
    name: 'Web Technology and Programming',
    lecHours: 2,
    labHours: 3,
    totalHours: 5,
    units: 3,
    room: 'ITECH 201',
    day: 'T',
    startTime: '1:30 PM',
    endTime: '3:30 PM'
  },
  {
    code: 'CPET 102',
    name: 'Web Technology and Programming',
    lecHours: 2,
    labHours: 3,
    totalHours: 5,
    units: 3,
    room: 'ITECH 204',
    day: 'F',
    startTime: '1:30 PM',
    endTime: '4:30 PM'
  },
  {
    code: 'CMPE 105',
    name: 'Computer Hardware Fundamentals',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 212',
    day: 'S',
    startTime: '2:30 PM',
    endTime: '4:30 PM'
  },
  {
    code: 'CMPE 105',
    name: 'Computer Hardware Fundamentals',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 212',
    day: 'S',
    startTime: '4:30 PM',
    endTime: '7:30 PM'
  },
  {
    code: 'ENSC 013',
    name: 'Engineering Drawing',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 213',
    day: 'T',
    startTime: '6:00 PM',
    endTime: '9:00 PM'
  },
  {
    code: 'CMPE 102',
    name: 'Programming Logic and Design',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    room: 'ITECH 205',
    day: 'F',
    startTime: '6:00 PM',
    endTime: '9:00 PM'
  },
  {
    code: 'MATH 101',
    name: 'Calculus 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    room: 'ITECH 201',
    day: 'M',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    code: 'CWTS 001',
    name: 'Civic Welfare Training Service 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 0,
    units: 3,
    room: 'FIELD',
    day: 'SUN',
    startTime: '8:00 AM',
    endTime: '12:00 PM'
  },
  {
    code: 'CWTS 001',
    name: 'Civic Welfare Training Service 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 0,
    units: 3,
    room: 'FIELD',
    day: 'SUN',
    startTime: '1:00 PM',
    endTime: '5:00 PM'
  },
  {
    code: 'ROTC 001',
    name: 'Reserved Officer Training Corps 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    room: 'FIELD',
    day: 'SUN',
    startTime: '8:00 AM',
    endTime: '12:00 PM'
  },
  {
    code: 'ROTC 001',
    name: 'Reserved Officer Training Corps 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    room: 'FIELD',
    day: 'SUN',
    startTime: '1:00 PM',
    endTime: '5:00 PM'
  }
];

// Helper function to convert day string to number
const getDayNumber = (dayStr: string): number => {
  const dayMapping: { [key: string]: number } = {
    'M': 1, 'T': 2, 'W': 3, 'TH': 4, 'F': 5, 'S': 6, 'SUN': 0
  };
  return dayMapping[dayStr] || 0;
};

// Helper function to convert time string to 24-hour format
const convertTime = (timeStr: string): string => {
  const [time, period] = timeStr.split(/(?=[AP]M)/);
  let [hours, minutes] = time.split(':').map(n => parseInt(n));
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to determine if time slot is night section (after 4:30 PM)
const isNightSection = (startTime: string): boolean => {
  const startMinutes = timeToMinutes(convertTime(startTime));
  const nightStartMinutes = timeToMinutes('16:30'); // 4:30 PM
  return startMinutes >= nightStartMinutes;
};

const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to determine class type
const getClassType = (lecHours: number, labHours: number): 'Regular' | 'Laboratory' | 'Lecture' | 'Combined' => {
  if (lecHours > 0 && labHours > 0) return 'Combined';
  if (labHours > 0) return 'Laboratory';
  if (lecHours > 0) return 'Lecture';
  return 'Regular';
};

export class DCPET1_3DataAdder {
  static async addData() {
    console.log('Starting DCPET 1-3 data addition...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const sectionRepo = AppDataSource.getRepository(Section);

    try {
      // Step 1: Update academic year and semester
      const academicYear = '2025-2026';
      const semester = 'First';

      console.log(`Adding DCPET 1-3 data for ${semester} semester, ${academicYear}...`);

      // Step 2: Create or update courses for the new academic year
      console.log('Creating/updating courses for 2025-2026...');
      const createdCourses: { [key: string]: Course } = {};

      // Group schedule data by course code to get unique courses
      const uniqueCourses = new Map<string, NewCourseData>();
      for (const item of newScheduleData) {
        if (!uniqueCourses.has(item.code)) {
          uniqueCourses.set(item.code, item);
        }
      }

      for (const [courseCode, courseData] of uniqueCourses) {
        // Check if course already exists for this academic year
        let existingCourse = await courseRepo.findOne({ 
          where: { 
            code: courseCode, 
            academicYear: academicYear,
            semester: semester
          } 
        });
        
        if (existingCourse) {
          // Update existing course
          existingCourse.name = courseData.name;
          existingCourse.credits = courseData.units;
          existingCourse.contactHours = courseData.totalHours;
          existingCourse.requiresNightSection = newScheduleData.some(item => 
            item.code === courseCode && isNightSection(item.startTime)
          );
          
          const savedCourse = await courseRepo.save(existingCourse);
          createdCourses[courseCode] = savedCourse;
          console.log(`Updated existing course: ${courseCode} - ${courseData.name}`);
        } else {
          // Create new course
          const course = courseRepo.create({
            code: courseCode,
            name: courseData.name,
            credits: courseData.units,
            contactHours: courseData.totalHours,
            program: 'Diploma in Computer Engineering Technology',
            department: 'Department Of Computer And Electronics Engineering Technology',
            semester: semester,
            academicYear: academicYear,
            requiresNightSection: newScheduleData.some(item => 
              item.code === courseCode && isNightSection(item.startTime)
            ),
            maxStudents: 30,
            enrolledStudents: Math.floor(Math.random() * 5) + 25, // Random between 25-29
            isActive: true
          });

          const savedCourse = await courseRepo.save(course);
          createdCourses[courseCode] = savedCourse;
          console.log(`Created new course: ${courseCode} - ${courseData.name}`);
        }
      }

      // Step 3: Create new sections for DCPET 1-3
      console.log('Creating new sections for DCPET 1-3...');

      for (const scheduleItem of newScheduleData) {
        const course = createdCourses[scheduleItem.code];
        if (!course) continue;

        // Check if section already exists for this course
        const existingSection = await sectionRepo.findOne({
          where: {
            sectionCode: 'DCPET 1-3',
            courseId: course.id
          }
        });

        if (existingSection) {
          // Update existing section with additional time slot
          const currentTimeSlots = existingSection.timeSlots || [];
          const newTimeSlot = {
            dayOfWeek: getDayNumber(scheduleItem.day),
            startTime: convertTime(scheduleItem.startTime),
            endTime: convertTime(scheduleItem.endTime)
          };

          // Add new time slot if it doesn't already exist
          const timeSlotExists = currentTimeSlots.some(slot =>
            slot.dayOfWeek === newTimeSlot.dayOfWeek &&
            slot.startTime === newTimeSlot.startTime &&
            slot.endTime === newTimeSlot.endTime
          );

          if (!timeSlotExists) {
            currentTimeSlots.push(newTimeSlot);
            existingSection.timeSlots = currentTimeSlots;
            await sectionRepo.save(existingSection);
            console.log(`Updated section for ${scheduleItem.code} with additional time slot`);
          }
        } else {
          // Create new section
          const section = sectionRepo.create({
            sectionCode: 'DCPET 1-3',
            courseId: course.id,
            facultyId: undefined, // Unassigned initially
            status: 'Planning' as const,
            classType: getClassType(scheduleItem.lecHours, scheduleItem.labHours),
            semester: semester,
            academicYear: academicYear,
            maxStudents: 30,
            enrolledStudents: Math.floor(Math.random() * 5) + 25,
            room: scheduleItem.room,
            timeSlots: [{
              dayOfWeek: getDayNumber(scheduleItem.day),
              startTime: convertTime(scheduleItem.startTime),
              endTime: convertTime(scheduleItem.endTime)
            }],
            isNightSection: isNightSection(scheduleItem.startTime),
            isActive: true
          });

          await sectionRepo.save(section);
          console.log(`Created section for ${scheduleItem.code} - ${scheduleItem.name}`);
        }
      }

      console.log('DCPET 1-3 data addition completed successfully!');
      
      // Step 4: Display summary
      const totalCourses = await courseRepo.count({
        where: { semester: semester, academicYear: academicYear }
      });
      const totalSections = await sectionRepo.count({
        where: { sectionCode: 'DCPET 1-3', academicYear: academicYear }
      });

      console.log(`Summary:`);
      console.log(`- Total courses created/updated: ${uniqueCourses.size}`);
      console.log(`- Total DCPET 1-3 sections created: ${totalSections}`);
      console.log(`- Total courses in ${semester} semester ${academicYear}: ${totalCourses}`);

    } catch (error) {
      console.error('Error adding DCPET 1-3 data:', error);
      throw error;
    }
  }
}

// Run the addition if this file is executed directly
if (require.main === module) {
  DCPET1_3DataAdder.addData()
    .then(() => {
      console.log('Addition completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Addition failed:', error);
      process.exit(1);
    });
}