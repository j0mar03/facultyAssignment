import { AppDataSource } from '../config/database';
import { Section } from '../entities/Section';
import { Course } from '../entities/Course';

// Data extracted from 2526 1st Year DECET.md for 2nd semester
const sectionsData = [
  // Section 1 (DECET 1-1)
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'CWTS 002',
    courseName: 'Civic Welfare Training Service 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ECEN 102',
    courseName: 'Basic Electronics 2',
    lectureHours: 0,
    laboratoryHours: 6,
    credits: 2,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Laboratory' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ECEN 201',
    courseName: 'Electronics 1: Electronic Devices and Circuits Theory',
    lectureHours: 3,
    laboratoryHours: 3,
    credits: 4,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ECET 102',
    courseName: 'Consumer Electronics Servicing 2',
    lectureHours: 2,
    laboratoryHours: 3,
    credits: 3,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ENGL 012',
    courseName: 'Technical Communication',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ENSC 014',
    courseName: 'Computer-Aided Drafting',
    lectureHours: 0,
    laboratoryHours: 3,
    credits: 1,
    room: 'IT205',
    maxStudents: 60,
    classType: 'Laboratory' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'MATH 103',
    courseName: 'Calculus 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'PATHFIT 2',
    courseName: 'Physical Activity Towards Health and Fitness 2',
    lectureHours: 2,
    laboratoryHours: 0,
    credits: 2,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'PHYS 013',
    courseName: 'Physics for Engineers (Calculus-based)',
    lectureHours: 3,
    laboratoryHours: 3,
    credits: 4,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-1',
    courseCode: 'ROTC 002',
    courseName: 'Reserved Officer Training Corps 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Lecture' as const
  },

  // Section 2 (DECET 1-2)
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'CWTS 002',
    courseName: 'Civic Welfare Training Service 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ECEN 102',
    courseName: 'Basic Electronics 2',
    lectureHours: 0,
    laboratoryHours: 6,
    credits: 2,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Laboratory' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ECEN 201',
    courseName: 'Electronics 1: Electronic Devices and Circuits Theory',
    lectureHours: 3,
    laboratoryHours: 3,
    credits: 4,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ECET 102',
    courseName: 'Consumer Electronics Servicing 2',
    lectureHours: 2,
    laboratoryHours: 3,
    credits: 3,
    room: 'IT200',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ENGL 012',
    courseName: 'Technical Communication',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ENSC 014',
    courseName: 'Computer-Aided Drafting',
    lectureHours: 0,
    laboratoryHours: 3,
    credits: 1,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Laboratory' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'MATH 103',
    courseName: 'Calculus 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'PATHFIT 2',
    courseName: 'Physical Activity Towards Health and Fitness 2',
    lectureHours: 2,
    laboratoryHours: 0,
    credits: 2,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Lecture' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'PHYS 013',
    courseName: 'Physics for Engineers (Calculus-based)',
    lectureHours: 3,
    laboratoryHours: 3,
    credits: 4,
    room: 'TBA',
    maxStudents: 60,
    classType: 'Combined' as const
  },
  {
    sectionCode: 'DECET 1-2',
    courseCode: 'ROTC 002',
    courseName: 'Reserved Officer Training Corps 2',
    lectureHours: 3,
    laboratoryHours: 0,
    credits: 3,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Lecture' as const
  }
];

export const add2526FirstYearDECETSecondSemesterSections = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    const sectionRepo = AppDataSource.getRepository(Section);
    const courseRepo = AppDataSource.getRepository(Course);

    const semester = 'Second';
    const academicYear = '2025-2026';

    // First, collect unique courses and create them if they don't exist
    const uniqueCourses = new Map<string, typeof sectionsData[0]>();
    for (const data of sectionsData) {
      if (!uniqueCourses.has(data.courseCode)) {
        uniqueCourses.set(data.courseCode, data);
      }
    }

    console.log(`\n📚 Creating/verifying ${uniqueCourses.size} courses...`);
    const courseMap = new Map<string, Course>();

    for (const [courseCode, data] of uniqueCourses) {
      try {
        // Try to find existing course (checking by code only, not semester/year)
        let course = await courseRepo.findOne({
          where: { code: courseCode, isActive: true }
        });

        if (!course) {
          // Create the course
          const contactHours = data.lectureHours + data.laboratoryHours;
          course = courseRepo.create({
            code: courseCode,
            name: data.courseName,
            credits: data.credits,
            contactHours: contactHours,
            lectureHours: data.lectureHours,
            laboratoryHours: data.laboratoryHours,
            program: 'Diploma in Electronics Engineering Technology',
            department: 'Department Of Computer And Electronics Engineering Technology',
            semester: semester,
            academicYear: academicYear,
            requiresNightSection: false,
            maxStudents: 60,
            enrolledStudents: 0,
            isActive: true
          });
          course = await courseRepo.save(course);
          console.log(`✅ Created course: ${courseCode} - ${data.courseName}`);
        } else {
          console.log(`✓ Course exists: ${courseCode} - ${data.courseName}`);
        }
        courseMap.set(courseCode, course);
      } catch (error: any) {
        console.error(`❌ Error creating course ${courseCode}:`, error.message);
      }
    }

    console.log(`\n📝 Creating sections...`);
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const data of sectionsData) {
      try {
        // Get the course from our map
        const course = courseMap.get(data.courseCode);

        if (!course) {
          console.log(`⚠️  Course ${data.courseCode} not available, skipping section ${data.sectionCode} for ${data.courseCode}`);
          skippedCount++;
          continue;
        }

        // Check if section already exists
        const existingSection = await sectionRepo.findOne({
          where: {
            sectionCode: data.sectionCode,
            courseId: course.id,
            semester: semester,
            academicYear: academicYear,
            isActive: true
          }
        });

        if (existingSection) {
          console.log(`⏭️  Section ${data.sectionCode} for ${data.courseCode} already exists, skipping`);
          skippedCount++;
          continue;
        }

        // Create the section
        const section = sectionRepo.create({
          sectionCode: data.sectionCode,
          courseId: course.id,
          status: 'Planning',
          classType: data.classType,
          semester: semester,
          academicYear: academicYear,
          maxStudents: data.maxStudents,
          enrolledStudents: 0,
          room: data.room,
          lectureHours: data.lectureHours,
          laboratoryHours: data.laboratoryHours,
          isNightSection: false, // Will be determined later if needed
          notes: `Added for ${academicYear} ${semester} Semester - 1st Year DECET`
        });

        await sectionRepo.save(section);
        console.log(`✅ Created section ${data.sectionCode} for ${data.courseCode} (${data.courseName})`);
        createdCount++;

      } catch (error: any) {
        console.error(`❌ Error creating section ${data.sectionCode} for ${data.courseCode}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} sections`);
    console.log(`   ⏭️  Skipped: ${skippedCount} sections`);
    console.log(`   ❌ Errors: ${errorCount} sections`);

    await AppDataSource.destroy();
    console.log('\n✅ Script completed successfully');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
};

// Run the script if called directly
if (require.main === module) {
  add2526FirstYearDECETSecondSemesterSections();
}

