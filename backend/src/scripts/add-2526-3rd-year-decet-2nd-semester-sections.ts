import { AppDataSource } from '../config/database';
import { Section } from '../entities/Section';
import { Course } from '../entities/Course';

// Data extracted from 2526 3rd Year DECET.md for 2nd semester
const sectionsData = [
  // Section 1 (DECET 3-1)
  {
    sectionCode: 'DECET 3-1',
    courseCode: 'ECET 306',
    courseName: 'Seminars, Issues and Trends in ECET',
    lectureHours: 0,
    laboratoryHours: 6,
    credits: 2,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Laboratory' as const,
  },
  {
    sectionCode: 'DECET 3-1',
    courseCode: 'ECET 305',
    courseName: 'Practicum 2 (300 hours)',
    lectureHours: 1,
    laboratoryHours: 6,
    credits: 3,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Combined' as const,
  },

  // Section 2 (DECET 3-2)
  {
    sectionCode: 'DECET 3-2',
    courseCode: 'ECET 306',
    courseName: 'Seminars, Issues and Trends in ECET',
    lectureHours: 0,
    laboratoryHours: 6,
    credits: 2,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Laboratory' as const,
  },
  {
    sectionCode: 'DECET 3-2',
    courseCode: 'ECET 305',
    courseName: 'Practicum 2 (300 hours)',
    lectureHours: 1,
    laboratoryHours: 6,
    credits: 3,
    room: 'FIELD',
    maxStudents: 60,
    classType: 'Combined' as const,
  },
];

export const add2526ThirdYearDECETSecondSemesterSections = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    const sectionRepo = AppDataSource.getRepository(Section);
    const courseRepo = AppDataSource.getRepository(Course);

    const semester = 'Second';
    const academicYear = '2025-2026';

    // Collect unique courses and create them if they don't exist
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
        let course = await courseRepo.findOne({
          where: { code: courseCode, isActive: true },
        });

        if (!course) {
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
            maxStudents: data.maxStudents,
            enrolledStudents: 0,
            isActive: true,
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
        const course = courseMap.get(data.courseCode);

        if (!course) {
          console.log(
            `⚠️  Course ${data.courseCode} not available, skipping section ${data.sectionCode} for ${data.courseCode}`,
          );
          skippedCount++;
          continue;
        }

        const existingSection = await sectionRepo.findOne({
          where: {
            sectionCode: data.sectionCode,
            courseId: course.id,
            semester: semester,
            academicYear: academicYear,
            isActive: true,
          },
        });

        if (existingSection) {
          console.log(
            `⏭️  Section ${data.sectionCode} for ${data.courseCode} already exists, skipping`,
          );
          skippedCount++;
          continue;
        }

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
          isNightSection: false,
          notes: `Added for ${academicYear} ${semester} Semester - 3rd Year DECET`,
        });

        await sectionRepo.save(section);
        console.log(
          `✅ Created section ${data.sectionCode} for ${data.courseCode} (${data.courseName})`,
        );
        createdCount++;
      } catch (error: any) {
        console.error(
          `❌ Error creating section ${data.sectionCode} for ${data.courseCode}:`,
          error.message,
        );
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
  add2526ThirdYearDECETSecondSemesterSections();
}


