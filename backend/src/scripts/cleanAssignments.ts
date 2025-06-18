import { AppDataSource } from '../config/database';
import { Assignment } from '../entities/Assignment';
import { Section } from '../entities/Section';
import { Faculty } from '../entities/Faculty';

export class AssignmentCleaner {
  static async cleanAllAssignments() {
    console.log('Starting assignment cleanup...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const assignmentRepo = AppDataSource.getRepository(Assignment);
    const sectionRepo = AppDataSource.getRepository(Section);
    const facultyRepo = AppDataSource.getRepository(Faculty);

    try {
      // Step 1: Remove all assignments
      console.log('Removing all existing assignments...');
      const totalAssignments = await assignmentRepo.count();
      await assignmentRepo.clear();
      console.log(`Removed ${totalAssignments} assignments`);

      // Step 2: Clear faculty assignments from sections
      console.log('Clearing faculty assignments from sections...');
      const sections = await sectionRepo.find();
      for (const section of sections) {
        section.facultyId = undefined;
        section.status = 'Planning';
        await sectionRepo.save(section);
      }
      console.log(`Cleared faculty assignments from ${sections.length} sections`);

      // Step 3: Reset faculty load counters
      console.log('Resetting faculty load counters...');
      const faculty = await facultyRepo.find();
      for (const f of faculty) {
        f.currentRegularLoad = 0;
        f.currentExtraLoad = 0;
        await facultyRepo.save(f);
      }
      console.log(`Reset load counters for ${faculty.length} faculty members`);

      console.log('Assignment cleanup completed successfully!');
      
      // Summary
      console.log(`Summary:`);
      console.log(`- Assignments removed: ${totalAssignments}`);
      console.log(`- Sections reset: ${sections.length}`);
      console.log(`- Faculty load counters reset: ${faculty.length}`);

    } catch (error) {
      console.error('Error during assignment cleanup:', error);
      throw error;
    }
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  AssignmentCleaner.cleanAllAssignments()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}