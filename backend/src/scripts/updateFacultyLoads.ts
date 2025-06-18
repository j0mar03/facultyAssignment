import { AppDataSource } from '../config/database';
import { Faculty } from '../entities/Faculty';
import { Assignment } from '../entities/Assignment';

async function updateFacultyLoads() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('Database connected');

    const facultyRepo = AppDataSource.getRepository(Faculty);
    const assignmentRepo = AppDataSource.getRepository(Assignment);

    // Get all assignments with course data
    const assignments = await assignmentRepo.find({
      relations: ['course', 'faculty'],
      where: { status: 'Active' }
    });

    // Calculate loads per faculty
    const facultyLoadMap = new Map<string, { regularLoad: number; extraLoad: number }>();

    // Group assignments by faculty and course to avoid double counting
    const facultyCourseMap = new Map<string, Set<string>>();

    for (const assignment of assignments) {
      const facultyId = assignment.facultyId;
      const courseId = assignment.courseId;
      
      if (!facultyCourseMap.has(facultyId)) {
        facultyCourseMap.set(facultyId, new Set());
      }
      
      // Only count each course once per faculty
      if (!facultyCourseMap.get(facultyId)!.has(courseId)) {
        facultyCourseMap.get(facultyId)!.add(courseId);
        
        if (!facultyLoadMap.has(facultyId)) {
          facultyLoadMap.set(facultyId, { regularLoad: 0, extraLoad: 0 });
        }
        
        const load = facultyLoadMap.get(facultyId)!;
        const creditHours = parseFloat(assignment.creditHours.toString());
        
        if (assignment.type === 'Regular') {
          load.regularLoad += creditHours;
        } else {
          load.extraLoad += creditHours;
        }
        
        console.log(`Faculty ${assignment.faculty.fullName} - Course ${assignment.course.code}: ${creditHours} credits (${assignment.type})`);
      }
    }

    // Update faculty records
    for (const [facultyId, loads] of facultyLoadMap.entries()) {
      const faculty = await facultyRepo.findOne({ where: { id: facultyId } });
      if (faculty) {
        faculty.currentRegularLoad = loads.regularLoad;
        faculty.currentExtraLoad = loads.extraLoad;
        await facultyRepo.save(faculty);
        console.log(`Updated ${faculty.fullName}: Regular Load = ${loads.regularLoad}, Extra Load = ${loads.extraLoad}`);
      }
    }

    console.log('Faculty loads updated successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error updating faculty loads:', error);
    process.exit(1);
  }
}

updateFacultyLoads();