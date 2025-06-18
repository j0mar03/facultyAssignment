import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Faculty } from '../entities/Faculty';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';

export class ReportController {
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private courseRepo = AppDataSource.getRepository(Course);
  private assignmentRepo = AppDataSource.getRepository(Assignment);

  getDashboardData = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.find({
        relations: ['assignments'],
      });
      
      const courses = await this.courseRepo.find();
      
      const assignments = await this.assignmentRepo.find({
        relations: ['course'],
      });

      // Calculate statistics
      const totalFaculty = faculty.filter(f => f.isActive).length;
      const totalCourses = courses.filter(c => c.isActive).length;
      const totalAssignments = assignments.length;
      const pendingAssignments = assignments.filter(a => a.status === 'Proposed').length;
      
      // Calculate compliance issues
      let complianceIssues = 0;
      faculty.forEach(f => {
        if (f.consecutiveLowRatings >= 2) complianceIssues++;
        if (f.currentRegularLoad + f.currentExtraLoad > this.getMaxLoadForFaculty(f)) {
          complianceIssues++;
        }
      });
      
      // Calculate night class coverage
      const nightCourses = courses.filter(c => c.requiresNightSection);
      const coveredNightCourses = assignments.filter(a => 
        a.course && a.course.requiresNightSection && this.isNightTimeSlot(a.timeSlot)
      );
      const nightClassCoverage = nightCourses.length > 0 ? 
        Math.round((coveredNightCourses.length / nightCourses.length) * 100) : 100;

      // Generate alerts
      const alerts = [];
      if (pendingAssignments > 0) {
        alerts.push(`${pendingAssignments} assignments pending approval`);
      }
      if (complianceIssues > 0) {
        alerts.push(`${complianceIssues} compliance issues detected`);
      }
      if (nightClassCoverage < 80) {
        alerts.push(`Night class coverage is only ${nightClassCoverage}%`);
      }
      if (faculty.filter(f => f.consecutiveLowRatings >= 2).length > 0) {
        alerts.push(`${faculty.filter(f => f.consecutiveLowRatings >= 2).length} faculty restricted from extra load`);
      }

      const stats = {
        totalFaculty,
        totalCourses,
        totalAssignments,
        pendingAssignments,
        complianceIssues,
        nightClassCoverage,
      };

      res.json({ stats, alerts });
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ error: 'Failed to generate dashboard data' });
    }
  };

  private getMaxLoadForFaculty(faculty: Faculty): number {
    const limits = {
      Regular: 30, // 21 regular + 9 extra
      PartTime: 12, // 12 regular + 0 extra
      Temporary: 30, // 21 regular + 9 extra
      Designee: 24, // 18 regular + 6 extra
    };
    return limits[faculty.type as keyof typeof limits] || 0;
  }

  private isNightTimeSlot(timeSlot: any): boolean {
    if (!timeSlot || !timeSlot.startTime) return false;
    const startHour = parseInt(timeSlot.startTime.split(':')[0]);
    return startHour >= 16; // 4:00 PM or later
  }

  getLoadDistribution = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.find({
        relations: ['assignments', 'assignments.course'],
      });
      
      const distribution = faculty.map(f => ({
        facultyId: f.id,
        name: f.fullName,
        type: f.type,
        department: f.department,
        regularLoad: f.currentRegularLoad,
        extraLoad: f.currentExtraLoad,
        totalLoad: f.currentRegularLoad + f.currentExtraLoad,
        assignments: f.assignments.filter(a => a.status === 'Active').length,
      }));
      
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate load distribution report' });
    }
  };

  getComplianceReport = async (req: Request, res: Response) => {
    try {
      const violations: Array<{
        type: string;
        faculty?: string;
        course?: string;
        reason: string;
      }> = [];
      
      // Check faculty with excessive loads
      const faculty = await this.facultyRepo.find({
        relations: ['assignments'],
      });
      
      // Check night class coverage
      const nightCourses = await this.courseRepo.find({
        where: { requiresNightSection: true },
      });
      
      const nightAssignments = await this.assignmentRepo.find({
        relations: ['course'],
      });
      
      const coveredNightCourses = new Set(
        nightAssignments
          .filter(a => a.course.requiresNightSection)
          .map(a => a.courseId)
      );
      
      const uncoveredNightCourses = nightCourses.filter(
        c => !coveredNightCourses.has(c.id)
      );
      
      res.json({
        violations,
        nightClassCoverage: {
          total: nightCourses.length,
          covered: coveredNightCourses.size,
          percentage: (coveredNightCourses.size / nightCourses.length) * 100,
          uncovered: uncoveredNightCourses,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate compliance report' });
    }
  };

  getITEESSummary = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.find({
        relations: ['iteesHistory'],
      });
      
      const summary = faculty.map(f => ({
        facultyId: f.id,
        name: f.fullName,
        latestRating: f.latestITEESRating,
        consecutiveLowRatings: f.consecutiveLowRatings,
        restrictedFromExtraLoad: f.consecutiveLowRatings >= 2,
      }));
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate ITEES summary' });
    }
  };

  getNightClassesReport = async (req: Request, res: Response) => {
    try {
      const nightCourses = await this.courseRepo.find({
        where: { requiresNightSection: true },
        relations: ['assignments', 'assignments.faculty'],
      });
      
      const report = nightCourses.map(course => ({
        courseCode: course.code,
        courseName: course.name,
        program: course.program,
        assigned: course.assignments.length > 0,
        faculty: course.assignments.map(a => a.faculty.fullName).join(', '),
      }));
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate night classes report' });
    }
  };

  getDepartmentSummary = async (req: Request, res: Response) => {
    try {
      const department = req.params.department;
      
      const faculty = await this.facultyRepo.find({
        where: { department },
        relations: ['assignments'],
      });
      
      const courses = await this.courseRepo.find({
        where: { department },
      });
      
      const assignments = await this.assignmentRepo.find({
        relations: ['faculty', 'course'],
        where: { faculty: { department } },
      });
      
      res.json({
        department,
        facultyCount: faculty.length,
        courseCount: courses.length,
        assignmentCount: assignments.length,
        averageLoad: faculty.reduce((sum, f) => sum + f.currentRegularLoad + f.currentExtraLoad, 0) / faculty.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate department summary' });
    }
  };

  exportMonitoringSheet = async (req: Request, res: Response) => {
    try {
      // Generate monitoring sheet export
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=monitoring-sheet.xlsx');
      
      // Implementation for Excel export would go here
      res.json({ message: 'Export feature coming soon' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to export monitoring sheet' });
    }
  };
}