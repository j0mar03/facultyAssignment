import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';

const newCourses = [
  {
    code: 'CHEM 015',
    name: 'Chemistry for Engineers',
    credits: 4,
    contactHours: 6,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Chemistry fundamentals for engineering students'
  },
  {
    code: 'CMPE 102',
    name: 'Programming Logic and Design',
    credits: 2,
    contactHours: 6,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Introduction to programming concepts and logic'
  },
  {
    code: 'MATH 101',
    name: 'Calculus 1',
    credits: 3,
    contactHours: 3,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Differential and integral calculus'
  },
  {
    code: 'CPET 102',
    name: 'Web Technology and Programming',
    credits: 3,
    contactHours: 5,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Web development fundamentals'
  },
  {
    code: 'PATHFIT 1',
    name: 'Physical Activity Towards Health and Fitness 1',
    credits: 2,
    contactHours: 2,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Physical education and fitness'
  },
  {
    code: 'CWTS 001',
    name: 'Civic Welfare Training Service 1',
    credits: 3,
    contactHours: 0,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Community service and civic welfare training'
  },
  {
    code: 'ROTC 001',
    name: 'Reserved Officer Training Corps 1',
    credits: 3,
    contactHours: 3,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: false,
    description: 'Military science and leadership training'
  },
  {
    code: 'CMPE 105',
    name: 'Computer Hardware Fundamentals',
    credits: 2,
    contactHours: 6,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: true, // Has night section slots
    description: 'Computer hardware concepts and fundamentals'
  },
  {
    code: 'ENSC 013',
    name: 'Engineering Drawing',
    credits: 2,
    contactHours: 6,
    program: 'DCPET',
    department: 'Computer Engineering',
    semester: 'First',
    academicYear: '2025-2026',
    requiresNightSection: true, // Has night section slots
    description: 'Technical drawing and drafting for engineers'
  }
];

export const updateDCPET11Courses = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const courseRepo = AppDataSource.getRepository(Course);

    console.log('Creating new courses for DCPET 1-1...');

    for (const courseData of newCourses) {
      // Check if course already exists
      const existingCourse = await courseRepo.findOne({
        where: { code: courseData.code }
      });

      if (existingCourse) {
        console.log(`Course ${courseData.code} already exists, updating...`);
        await courseRepo.update(existingCourse.id, courseData);
      } else {
        console.log(`Creating course ${courseData.code}...`);
        const course = courseRepo.create(courseData);
        await courseRepo.save(course);
      }
    }

    console.log('All courses for DCPET 1-1 have been created/updated successfully!');
    
  } catch (error) {
    console.error('Error updating DCPET 1-1 courses:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Run the script if called directly
if (require.main === module) {
  updateDCPET11Courses();
}