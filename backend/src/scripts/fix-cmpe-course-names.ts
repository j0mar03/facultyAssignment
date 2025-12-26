import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';

async function fixCmpeCourseNames() {
  await AppDataSource.initialize();
  const courseRepo = AppDataSource.getRepository(Course);

  const fixes = [
    { code: 'CMPE 101', name: 'Computer Engineering as a Discipline' },
    { code: 'CMPE 201', name: 'Data Structures and Algorithm' },
    { code: 'CMPE 202', name: 'Operating Systems' },
  ];

  for (const fix of fixes) {
    const course = await courseRepo.findOne({ where: { code: fix.code, isActive: true } });
    if (!course) {
      console.log(`⚠️  Course not found: ${fix.code}, skipping`);
      continue;
    }
    if (course.name === fix.name) {
      console.log(`✓ Course already correct: ${fix.code} - ${course.name}`);
      continue;
    }
    course.name = fix.name;
    await courseRepo.save(course);
    console.log(`✅ Updated ${fix.code} to "${fix.name}"`);
  }

  await AppDataSource.destroy();
  console.log('✅ Done');
}

if (require.main === module) {
  fixCmpeCourseNames().catch((err) => {
    console.error('❌ Error fixing CMPE course names:', err);
    process.exit(1);
  });
}

