import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';
import { ITEESRecord } from '../entities/ITEESRecord';
import { Section } from '../entities/Section';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder {
  static async seed() {
    console.log('Starting database seeding...');
    
    try {
      await this.seedUsers();
      await this.seedFaculty();
      await this.seedCourses();
      await this.seedSections();
      await this.seedITEESRecords();
      await this.seedAssignments();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }

  private static async seedUsers() {
    const userRepo = AppDataSource.getRepository(User);
    
    // Check if admin user already exists
    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@pup.edu.ph' } });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping user seeding');
      return;
    }

    const users = [
      {
        email: 'admin@pup.edu.ph',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        department: 'IT',
        college: 'College of Engineering',
      },
      {
        email: 'fcruiz@pup.edu.ph',
        password: await bcrypt.hash('chair123', 10),
        firstName: 'Frescian C.',
        lastName: 'Ruiz',
        role: 'Chair',
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
      },
      {
        email: 'dean.engineering@pup.edu.ph',
        password: await bcrypt.hash('dean123', 10),
        firstName: 'Engineering',
        lastName: 'Dean',
        role: 'Dean',
        department: undefined,
        college: 'College of Engineering',
      },
      {
        email: 'jbruiz@pup.edu.ph',
        password: await bcrypt.hash('faculty123', 10),
        firstName: 'Jomar B.',
        lastName: 'Ruiz',
        role: 'Faculty',
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
      },
    ];

    for (const userData of users) {
      const user = userRepo.create(userData);
      await userRepo.save(user);
    }

    console.log('Users seeded successfully');
  }

  private static async seedFaculty() {
    const facultyRepo = AppDataSource.getRepository(Faculty);
    
    // Check if faculty already exist
    const existingFaculty = await facultyRepo.count();
    if (existingFaculty > 0) {
      console.log('Faculty already exist, skipping faculty seeding');
      return;
    }

    const facultyData = [
      // Regular Faculty with Designations
      {
        employeeId: 'PUP-DCEET-001',
        firstName: 'Frescian C.',
        lastName: 'Ruiz',
        email: 'fcruiz@pup.edu.ph',
        type: 'Designee' as const, // Chairperson is a designee with reduced load
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-002',
        firstName: 'Ronald D',
        lastName: 'Fernando',
        email: 'rdfernando@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-003',
        firstName: 'Jonathan C.',
        lastName: 'Manarang',
        email: 'jcmanarang@pup.edu.ph',
        type: 'Temporary' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-004',
        firstName: 'Remegio C.',
        lastName: 'Rios',
        email: 'rcrios@pup.edu.ph',
        type: 'Designee' as const, // Laboratory Head is a designee
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-005',
        firstName: 'Jomar B.',
        lastName: 'Ruiz',
        email: 'jbruiz@pup.edu.ph',
        type: 'Temporary' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      // Part-time Faculty
      {
        employeeId: 'FA0320MN2023',
        firstName: 'Aaron Charles Regis',
        lastName: 'Alday',
        email: 'acralday@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'FA0135MN2019',
        firstName: 'Isaiah Nikkolai M.',
        lastName: 'Andaya',
        email: 'inmandaya@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-006',
        firstName: 'Carlo O.',
        lastName: 'Cunanan',
        email: 'cocunanan@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-007',
        firstName: 'Jerome',
        lastName: 'De Guzman',
        email: 'jtdeguzman@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'FA0168MN2020',
        firstName: 'Ryan S.',
        lastName: 'Evangelista',
        email: 'rsevangelista@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-008',
        firstName: 'Patrick Jiorgen U.',
        lastName: 'Hulipas',
        email: 'pjuhulipas@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-009',
        firstName: 'Roste Mae',
        lastName: 'Macalos',
        email: 'rmmacalos@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'FA0043MN2021',
        firstName: 'Tanya',
        lastName: 'Martinez',
        email: 'tsmartinez@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-010',
        firstName: 'Jess Rhyan A.',
        lastName: 'Tiburcio',
        email: 'jratiburcio@pup.edu.ph',
        type: 'PartTime' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      // Regular Faculty
      {
        employeeId: 'PUP-DCEET-011',
        firstName: 'Roel D.',
        lastName: 'Cabrera',
        email: 'rdcabrera@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-012',
        firstName: 'Kenneth',
        lastName: 'Dazon',
        email: 'kpdazon@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-013',
        firstName: 'Jose Marie B.',
        lastName: 'Dipay',
        email: 'jmbdipay@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'PUP-DCEET-014',
        firstName: 'John Michael V.',
        lastName: 'Legaspi',
        email: 'jmvlegaspi@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      {
        employeeId: 'FA0140MN2020',
        firstName: 'Jake M.',
        lastName: 'Libed',
        email: 'jmlibed@pup.edu.ph',
        type: 'Regular' as const,
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
      // Casual Faculty (mapped to Temporary)
      {
        employeeId: 'PUP-DCEET-015',
        firstName: 'Joseph',
        lastName: 'Lequigan',
        email: 'jblequigan@pup.edu.ph',
        type: 'Temporary' as const, // Casual mapped to Temporary
        department: 'Department Of Computer And Electronics Engineering Technology',
        college: 'College of Engineering',
        currentRegularLoad: 0,
        currentExtraLoad: 0,
        consecutiveLowRatings: 0,
      },
    ];

    for (const data of facultyData) {
      const faculty = facultyRepo.create(data);
      await facultyRepo.save(faculty);
    }

    console.log('Faculty seeded successfully');
  }

  private static async seedCourses() {
    const courseRepo = AppDataSource.getRepository(Course);
    
    // Check if courses already exist
    const existingCourses = await courseRepo.count();
    if (existingCourses > 0) {
      console.log('Courses already exist, skipping course seeding');
      return;
    }

    const coursesData = [
      // Diploma in Computer Engineering Technology - First Year, Second Semester
      {
        code: 'CMPE 103',
        name: 'Object Oriented Programming',
        credits: 2.0,
        contactHours: 6.0,
        program: 'Diploma in Computer Engineering Technology',
        department: 'Department Of Computer And Electronics Engineering Technology',
        semester: 'Second',
        academicYear: '2024-2025',
        requiresNightSection: true, // Has evening sections
        maxStudents: 30,
        enrolledStudents: 25,
      },
      {
        code: 'CPET 101',
        name: 'Visual Graphic Design',
        credits: 2.0,
        contactHours: 6.0,
        program: 'Diploma in Computer Engineering Technology',
        department: 'Department Of Computer And Electronics Engineering Technology',
        semester: 'Second',
        academicYear: '2024-2025',
        requiresNightSection: true, // Has evening sections
        maxStudents: 30,
        enrolledStudents: 28,
      },
      {
        code: 'CPET 103',
        name: 'Web Technology and Programming 2',
        credits: 3.0,
        contactHours: 5.0,
        program: 'Diploma in Computer Engineering Technology',
        department: 'Department Of Computer And Electronics Engineering Technology',
        semester: 'Second',
        academicYear: '2024-2025',
        requiresNightSection: false,
        maxStudents: 30,
        enrolledStudents: 27,
      },
      {
        code: 'ENSC 014',
        name: 'Computer-Aided Drafting',
        credits: 1.0,
        contactHours: 3.0,
        program: 'Diploma in Computer Engineering Technology',
        department: 'Department Of Computer And Electronics Engineering Technology',
        semester: 'Second',
        academicYear: '2024-2025',
        requiresNightSection: true, // Has evening sections
        maxStudents: 30,
        enrolledStudents: 26,
      },
    ];

    for (const data of coursesData) {
      const course = courseRepo.create(data);
      await courseRepo.save(course);
    }

    console.log('Courses seeded successfully');
  }

  private static async seedSections() {
    const sectionRepo = AppDataSource.getRepository(Section);
    const courseRepo = AppDataSource.getRepository(Course);
    const facultyRepo = AppDataSource.getRepository(Faculty);
    
    // Check if sections already exist
    const existingSections = await sectionRepo.count();
    if (existingSections > 0) {
      console.log('Sections already exist, skipping section seeding');
      return;
    }

    const courses = await courseRepo.find();
    const faculty = await facultyRepo.find();

    if (courses.length === 0) {
      console.log('No courses found, skipping section seeding');
      return;
    }

    // Create sections based on the actual DCPET data
    const sectionsData: any[] = [
      // CMPE 103 - Object Oriented Programming sections
      {
        sectionCode: 'DCPET 1-1',
        courseId: courses.find(c => c.code === 'CMPE 103')?.id,
        facultyId: faculty.find(f => f.lastName === 'Libed')?.id,
        status: 'Active' as const,
        classType: 'Laboratory' as const,
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 25,
        room: 'TBA',
        timeSlots: [
          { dayOfWeek: 1, startTime: '16:30', endTime: '19:30' },
          { dayOfWeek: 4, startTime: '16:30', endTime: '19:30' }
        ],
        isNightSection: true
      },
      {
        sectionCode: 'DCPET 1-2',
        courseId: courses.find(c => c.code === 'CMPE 103')?.id,
        facultyId: faculty.find(f => f.lastName === 'Libed')?.id,
        status: 'Active',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 28,
        room: 'IT205',
        timeSlots: [
          { dayOfWeek: 2, startTime: '07:30', endTime: '10:30' },
          { dayOfWeek: 5, startTime: '07:30', endTime: '10:30' }
        ],
        isNightSection: false
      },
      {
        sectionCode: 'DCPET 1-3',
        courseId: courses.find(c => c.code === 'CMPE 103')?.id,
        facultyId: faculty.find(f => f.lastName === 'Libed')?.id,
        status: 'Active',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 26,
        room: 'IT205',
        timeSlots: [
          { dayOfWeek: 1, startTime: '13:30', endTime: '16:30' },
          { dayOfWeek: 4, startTime: '13:30', endTime: '16:30' }
        ],
        isNightSection: false
      },
      // CPET 101 - Visual Graphic Design sections
      {
        sectionCode: 'DCPET 1-1',
        courseId: courses.find(c => c.code === 'CPET 101')?.id,
        facultyId: faculty.find(f => f.firstName === 'Frescian C.')?.id,
        status: 'Active',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 27,
        room: 'IT204',
        timeSlots: [
          { dayOfWeek: 1, startTime: '10:30', endTime: '13:30' },
          { dayOfWeek: 4, startTime: '10:30', endTime: '13:30' }
        ],
        isNightSection: false
      },
      {
        sectionCode: 'DCPET 1-2',
        courseId: courses.find(c => c.code === 'CPET 101')?.id,
        facultyId: null,
        status: 'Planning',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 24,
        room: 'IT205',
        timeSlots: [
          { dayOfWeek: 3, startTime: '18:00', endTime: '21:00' }, // Wednesday 6:00PM-9:00PM
          { dayOfWeek: 6, startTime: '10:30', endTime: '13:30' }  // Saturday 10:30AM-1:30PM
        ],
        isNightSection: true
      },
      {
        sectionCode: 'DCPET 1-3',
        courseId: courses.find(c => c.code === 'CPET 101')?.id,
        facultyId: faculty.find(f => f.firstName === 'Frescian C.')?.id,
        status: 'Active',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 24,
        room: 'IT204',
        timeSlots: [
          { dayOfWeek: 1, startTime: '16:30', endTime: '18:00' }, // Monday 4:30PM-6:00PM
          { dayOfWeek: 4, startTime: '16:30', endTime: '18:00' }, // Thursday 4:30PM-6:00PM
          { dayOfWeek: 6, startTime: '07:30', endTime: '10:30' }  // Saturday 7:30AM-10:30AM
        ],
        isNightSection: true
      },
      // CPET 103 - Web Technology and Programming 2 sections
      {
        sectionCode: 'DCPET 1-1',
        courseId: courses.find(c => c.code === 'CPET 103')?.id,
        facultyId: faculty.find(f => f.firstName === 'Jerome')?.id,
        status: 'Active' as const,
        classType: 'Combined' as const,
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 29,
        room: 'IT204',
        timeSlots: [
          { dayOfWeek: 1, startTime: '07:30', endTime: '10:30' },
          { dayOfWeek: 4, startTime: '07:30', endTime: '09:30' }
        ],
        isNightSection: false
      },
      {
        sectionCode: 'DCPET 1-2',
        courseId: courses.find(c => c.code === 'CPET 103')?.id,
        facultyId: faculty.find(f => f.firstName === 'Jerome')?.id,
        status: 'Active',
        classType: 'Combined',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 26,
        room: 'IT204',
        timeSlots: [
          { dayOfWeek: 2, startTime: '10:30', endTime: '13:30' },
          { dayOfWeek: 5, startTime: '10:30', endTime: '12:30' }
        ],
        isNightSection: false
      },
      {
        sectionCode: 'DCPET 1-3',
        courseId: courses.find(c => c.code === 'CPET 103')?.id,
        facultyId: faculty.find(f => f.firstName === 'Jerome')?.id,
        status: 'Active',
        classType: 'Combined',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 28,
        room: 'IT204',
        timeSlots: [
          { dayOfWeek: 1, startTime: '10:30', endTime: '12:30' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '13:00' }
        ],
        isNightSection: false
      },
      // ENSC 014 - Computer-Aided Drafting sections (unassigned for demonstration)
      {
        sectionCode: 'DCPET 1-1',
        courseId: courses.find(c => c.code === 'ENSC 014')?.id,
        status: 'Planning' as const,
        classType: 'Laboratory' as const,
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 22,
        room: 'TBA',
        timeSlots: [
          { dayOfWeek: 6, startTime: '07:30', endTime: '10:30' }
        ],
        isNightSection: false
      },
      {
        sectionCode: 'DCPET 1-2',
        courseId: courses.find(c => c.code === 'ENSC 014')?.id,
        status: 'Planning',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 20,
        room: 'IT205',
        timeSlots: [
          { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' }
        ],
        isNightSection: true
      },
      {
        sectionCode: 'DCPET 1-3',
        courseId: courses.find(c => c.code === 'ENSC 014')?.id,
        facultyId: null,
        status: 'Planning',
        classType: 'Laboratory',
        semester: 'Second',
        academicYear: '2024-2025',
        maxStudents: 30,
        enrolledStudents: 25,
        room: 'TBA',
        timeSlots: [
          { dayOfWeek: 5, startTime: '18:00', endTime: '21:00' } // Friday 6:00PM-9:00PM
        ],
        isNightSection: true
      }
    ];

    for (const data of sectionsData) {
      if (data.courseId) {
        const section = sectionRepo.create(data);
        await sectionRepo.save(section);
      }
    }

    console.log('Sections seeded successfully');
  }

  private static async seedITEESRecords() {
    const iteesRepo = AppDataSource.getRepository(ITEESRecord);
    const facultyRepo = AppDataSource.getRepository(Faculty);
    
    // Check if ITEES records already exist
    const existingRecords = await iteesRepo.count();
    if (existingRecords > 0) {
      console.log('ITEES records already exist, skipping ITEES seeding');
      return;
    }

    const faculty = await facultyRepo.find();
    
    const ratingsData = [
      { rating: 'Outstanding' as const, numericalScore: 4.8 },
      { rating: 'Very Satisfactory' as const, numericalScore: 4.2 },
      { rating: 'Satisfactory' as const, numericalScore: 3.5 },
      { rating: 'Very Satisfactory' as const, numericalScore: 4.0 },
      { rating: 'Outstanding' as const, numericalScore: 4.9 },
    ];

    for (let i = 0; i < faculty.length && i < ratingsData.length; i++) {
      const record = iteesRepo.create({
        facultyId: faculty[i].id,
        semester: 'First',
        academicYear: '2023-2024',
        rating: ratingsData[i].rating,
        numericalScore: ratingsData[i].numericalScore,
        evaluatorCount: 25,
        comments: 'Excellent performance in teaching and research.',
      });
      await iteesRepo.save(record);
    }

    console.log('ITEES records seeded successfully');
  }

  private static async seedAssignments() {
    const assignmentRepo = AppDataSource.getRepository(Assignment);
    const facultyRepo = AppDataSource.getRepository(Faculty);
    const courseRepo = AppDataSource.getRepository(Course);
    
    // Check if assignments already exist
    const existingAssignments = await assignmentRepo.count();
    if (existingAssignments > 0) {
      console.log('Assignments already exist, skipping assignment seeding');
      return;
    }

    // Get all faculty and courses
    const allFaculty = await facultyRepo.find();
    const allCourses = await courseRepo.find();

    if (allFaculty.length === 0 || allCourses.length === 0) {
      console.log('No faculty or courses found, skipping assignment seeding');
      return;
    }

    // Create maps for easy lookup
    const facultyMap: { [key: string]: any } = {};
    allFaculty.forEach(f => {
      const fullName = `${f.lastName}, ${f.firstName}`.toUpperCase();
      facultyMap[fullName] = f;
    });

    const courseMap: { [key: string]: any } = {};
    allCourses.forEach(c => {
      courseMap[c.code] = c;
    });

    // Helper function to convert day string to number
    const getDayNumber = (dayStr: string): number[] => {
      const dayMapping: { [key: string]: number } = {
        'M': 1, 'T': 2, 'W': 3, 'TH': 4, 'F': 5, 'S': 6, 'SU': 0
      };
      return dayStr.split('/').map(d => dayMapping[d.trim()] || 0);
    };

    // Helper function to convert time string to 24-hour format
    const convertTime = (timeStr: string): string => {
      const [time, period] = timeStr.split(/(?=[AP]M)/);
      let [hours, minutes] = time.split(':').map(n => parseInt(n));
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Actual assignments data based on the provided schedule
    const assignmentsData = [
      // CMPE 103 - Object Oriented Programming
      {
        facultyName: 'LIBED, JAKE M.',
        courseCode: 'CMPE 103',
        section: 'DCPET 1-1',
        room: 'TBA',
        days: 'M/TH',
        times: '04:30PM-07:30PM/04:30PM-07:30PM',
      },
      {
        facultyName: 'LIBED, JAKE M.',
        courseCode: 'CMPE 103',
        section: 'DCPET 1-2',
        room: 'IT205',
        days: 'T/F',
        times: '07:30AM-10:30AM/07:30AM-10:30AM',
      },
      {
        facultyName: 'LIBED, JAKE M.',
        courseCode: 'CMPE 103',
        section: 'DCPET 1-3',
        room: 'IT205',
        days: 'M/TH',
        times: '01:30PM-04:30PM/01:30PM-04:30PM',
      },
      // CPET 101 - Visual Graphic Design
      {
        facultyName: 'RUIZ, FRESCIAN C.',
        courseCode: 'CPET 101',
        section: 'DCPET 1-1',
        room: 'IT204',
        days: 'M/TH',
        times: '10:30AM-01:30PM/10:30AM-01:30PM',
      },
      {
        facultyName: 'RUIZ, FRESCIAN C.',
        courseCode: 'CPET 101',
        section: 'DCPET 1-3',
        room: 'IT204',
        days: 'M/TH/S',
        times: '04:30PM-06:00PM/04:30PM-06:00PM/07:30AM-10:30AM',
      },
      // CPET 103 - Web Technology and Programming 2
      {
        facultyName: 'DE GUZMAN, JEROME',
        courseCode: 'CPET 103',
        section: 'DCPET 1-1',
        room: 'IT204',
        days: 'M/TH',
        times: '07:30AM-10:30AM/07:30AM-09:30AM',
      },
      {
        facultyName: 'DE GUZMAN, JEROME',
        courseCode: 'CPET 103',
        section: 'DCPET 1-2',
        room: 'IT204',
        days: 'T/F',
        times: '10:30AM-01:30PM/10:30AM-12:30PM',
      },
      {
        facultyName: 'DE GUZMAN, JEROME',
        courseCode: 'CPET 103',
        section: 'DCPET 1-3',
        room: 'IT204',
        days: 'M/TH',
        times: '10:30AM-12:30PM/10:00AM-01:00PM',
      },
    ];

    // Process each assignment
    for (const data of assignmentsData) {
      const faculty = facultyMap[data.facultyName];
      const course = courseMap[data.courseCode];

      if (!faculty || !course) {
        console.log(`Skipping assignment: Faculty ${data.facultyName} or Course ${data.courseCode} not found`);
        continue;
      }

      // Parse days and times
      const days = getDayNumber(data.days);
      const timePairs = data.times.split('/');

      // Create assignment for each day
      for (let i = 0; i < days.length && i < timePairs.length; i++) {
        const [startTime, endTime] = timePairs[i].split('-').map(t => convertTime(t.trim()));
        
        const assignment = assignmentRepo.create({
          facultyId: faculty.id,
          courseId: course.id,
          type: 'Regular' as const,
          status: 'Active' as const,
          timeSlot: {
            dayOfWeek: days[i],
            startTime: startTime,
            endTime: endTime,
          },
          semester: 'Second',
          academicYear: '2024-2025',
          section: data.section,
          room: data.room === 'TBA' ? undefined : data.room,
          creditHours: course.credits,
          contactHours: course.contactHours,
        });
        
        await assignmentRepo.save(assignment);
      }
    }

    // Update faculty load counts
    const assignments = await assignmentRepo.find({ relations: ['course'] });
    const facultyLoadMap = new Map<string, { regularLoad: number; extraLoad: number }>();
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
      }
    }

    // Update faculty records with calculated loads
    for (const [facultyId, loads] of facultyLoadMap.entries()) {
      const facultyMember = await facultyRepo.findOne({ where: { id: facultyId } });
      if (facultyMember) {
        facultyMember.currentRegularLoad = loads.regularLoad;
        facultyMember.currentExtraLoad = loads.extraLoad;
        await facultyRepo.save(facultyMember);
      }
    }

    console.log('Assignments seeded successfully');
  }
}