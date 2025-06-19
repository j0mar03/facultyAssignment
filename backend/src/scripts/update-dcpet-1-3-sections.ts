import { AppDataSource } from '../config/database';
import { Section } from '../entities/Section';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';

// Helper function to convert day name to number
const getDayNumber = (day: string): number => {
  const dayMap: { [key: string]: number } = {
    'M': 1,      // Monday
    'T': 2,      // Tuesday
    'W': 3,      // Wednesday
    'TH': 4,     // Thursday
    'F': 5,      // Friday
    'S': 6,      // Saturday
    'SUN': 0     // Sunday
  };
  return dayMap[day] || 1;
};

// Helper function to convert 12-hour time to 24-hour format
const convertTo24Hour = (time: string): string => {
  const [timePart, period] = time.split(' ');
  const [hours, minutes] = timePart.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// Schedule data for DCPET 1-3
const scheduleData = [
  {
    courseCode: 'PATHFIT 1',
    courseName: 'Physical Activity Towards Health and Fitness 1',
    lecHours: 2,
    labHours: 0,
    totalHours: 2,
    units: 2,
    section: 'DCPET 1-3',
    room: 'OpnCourtPE',
    day: 'T',
    startTime: '11:00 AM',
    endTime: '1:00 PM'
  },
  {
    courseCode: 'CHEM 015',
    courseName: 'Chemistry for Engineers',
    lecHours: 3,
    labHours: 3,
    totalHours: 6,
    units: 4,
    section: 'DCPET 1-3',
    room: 'ITECH 213',
    day: 'T',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    courseCode: 'CHEM 015',
    courseName: 'Chemistry for Engineers',
    lecHours: 3,
    labHours: 3,
    totalHours: 6,
    units: 4,
    section: 'DCPET 1-3',
    room: 'ITECH 213',
    day: 'F',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    courseCode: 'CMPE 102',
    courseName: 'Programming Logic and Design',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 204',
    day: 'M',
    startTime: '10:30 AM',
    endTime: '1:30 PM'
  },
  {
    courseCode: 'ENSC 013',
    courseName: 'Engineering Drawing',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 213',
    day: 'S',
    startTime: '10:30 AM',
    endTime: '1:30 PM'
  },
  {
    courseCode: 'CPET 102',
    courseName: 'Web Technology and Programming',
    lecHours: 2,
    labHours: 3,
    totalHours: 5,
    units: 3,
    section: 'DCPET 1-3',
    room: 'ITECH 201',
    day: 'T',
    startTime: '1:30 PM',
    endTime: '3:30 PM'
  },
  {
    courseCode: 'CPET 102',
    courseName: 'Web Technology and Programming',
    lecHours: 2,
    labHours: 3,
    totalHours: 5,
    units: 3,
    section: 'DCPET 1-3',
    room: 'ITECH 204',
    day: 'F',
    startTime: '1:30 PM',
    endTime: '4:30 PM'
  },
  {
    courseCode: 'CMPE 105',
    courseName: 'Computer Hardware Fundamentals',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 212',
    day: 'S',
    startTime: '2:30 PM',
    endTime: '4:30 PM'
  },
  {
    courseCode: 'CMPE 105',
    courseName: 'Computer Hardware Fundamentals',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 212',
    day: 'S',
    startTime: '4:30 PM',
    endTime: '7:30 PM'
  },
  {
    courseCode: 'ENSC 013',
    courseName: 'Engineering Drawing',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 213',
    day: 'T',
    startTime: '6:00 PM',
    endTime: '9:00 PM'
  },
  {
    courseCode: 'CMPE 102',
    courseName: 'Programming Logic and Design',
    lecHours: 0,
    labHours: 6,
    totalHours: 6,
    units: 2,
    section: 'DCPET 1-3',
    room: 'ITECH 205',
    day: 'F',
    startTime: '6:00 PM',
    endTime: '9:00 PM'
  },
  {
    courseCode: 'MATH 101',
    courseName: 'Calculus 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    section: 'DCPET 1-3',
    room: 'ITECH 201',
    day: 'M',
    startTime: '7:30 AM',
    endTime: '10:30 AM'
  },
  {
    courseCode: 'CWTS 001',
    courseName: 'Civic Welfare Training Service 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 0,
    units: 3,
    section: 'DCPET 1-3',
    room: 'FIELD',
    day: 'SUN',
    startTime: '8:00 AM',
    endTime: '12:00 PM'
  },
  {
    courseCode: 'CWTS 001',
    courseName: 'Civic Welfare Training Service 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 0,
    units: 3,
    section: 'DCPET 1-3',
    room: 'FIELD',
    day: 'SUN',
    startTime: '1:00 PM',
    endTime: '5:00 PM'
  },
  {
    courseCode: 'ROTC 001',
    courseName: 'Reserved Officer Training Corps 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    section: 'DCPET 1-3',
    room: 'FIELD',
    day: 'SUN',
    startTime: '8:00 AM',
    endTime: '12:00 PM'
  },
  {
    courseCode: 'ROTC 001',
    courseName: 'Reserved Officer Training Corps 1',
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    units: 3,
    section: 'DCPET 1-3',
    room: 'FIELD',
    day: 'SUN',
    startTime: '1:00 PM',
    endTime: '5:00 PM'
  }
];

export const updateDCPET13Sections = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const sectionRepo = AppDataSource.getRepository(Section);
    const courseRepo = AppDataSource.getRepository(Course);
    const assignmentRepo = AppDataSource.getRepository(Assignment);

    console.log('Removing existing DCPET 1-3 sections...');

    // First get the existing DCPET 1-3 sections
    const existingSections = await sectionRepo.find({
      where: {
        sectionCode: 'DCPET 1-3',
        academicYear: '2025-2026',
        semester: 'First'
      }
    });

    // Delete assignments that reference these sections
    for (const section of existingSections) {
      await assignmentRepo.delete({ sectionId: section.id });
      console.log(`Deleted assignments for section ${section.id}`);
    }

    // Now delete the sections
    await sectionRepo.delete({
      sectionCode: 'DCPET 1-3',
      academicYear: '2025-2026',
      semester: 'First'
    });

    console.log('Creating new DCPET 1-3 sections...');

    // Group schedule data by course to handle multiple time slots
    const courseTimeSlots: { [key: string]: any[] } = {};
    
    for (const item of scheduleData) {
      if (!courseTimeSlots[item.courseCode]) {
        courseTimeSlots[item.courseCode] = [];
      }
      courseTimeSlots[item.courseCode].push({
        dayOfWeek: getDayNumber(item.day),
        startTime: convertTo24Hour(item.startTime),
        endTime: convertTo24Hour(item.endTime),
        room: item.room
      });
    }

    // Create sections for each unique course
    const uniqueCourses = [...new Set(scheduleData.map(item => item.courseCode))];
    
    for (const courseCode of uniqueCourses) {
      const courseInfo = scheduleData.find(item => item.courseCode === courseCode);
      if (!courseInfo) continue;

      // Find the course in database (these should already exist from previous section creation)
      const course = await courseRepo.findOne({
        where: { code: courseCode }
      });

      if (!course) {
        console.log(`Course ${courseCode} not found in database`);
        continue;
      }

      // Determine if it's a night section
      const hasNightSection = courseTimeSlots[courseCode].some(slot => {
        const startHour = parseInt(slot.startTime.split(':')[0]);
        return startHour >= 18; // 6 PM or later
      });

      // Create the section
      const section = sectionRepo.create({
        sectionCode: 'DCPET 1-3',
        courseId: course.id,
        status: 'Planning',
        classType: courseInfo.labHours > 0 ? 'Laboratory' : 'Lecture',
        semester: 'First',
        academicYear: '2025-2026',
        maxStudents: 40,
        enrolledStudents: 30,
        room: courseTimeSlots[courseCode][0].room, // Use first room as primary
        timeSlots: courseTimeSlots[courseCode],
        isNightSection: hasNightSection,
        lectureHours: courseInfo.lecHours,
        laboratoryHours: courseInfo.labHours,
        notes: `Updated schedule for ${courseCode} in DCPET 1-3`
      });

      await sectionRepo.save(section);
      console.log(`Created section for ${courseCode} with ${courseTimeSlots[courseCode].length} time slots`);
    }

    console.log('DCPET 1-3 schedule update completed successfully!');
    console.log(`Total sections created: ${uniqueCourses.length}`);
    
  } catch (error) {
    console.error('Error updating DCPET 1-3 sections:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Run the script if called directly
if (require.main === module) {
  updateDCPET13Sections();
}