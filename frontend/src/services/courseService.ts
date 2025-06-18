import api from './api';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  contactHours: number;
  program: string;
  department: string;
  semester: string;
  academicYear: string;
  requiresNightSection: boolean;
  preferredTimeSlots?: any[];
  room?: string;
  maxStudents: number;
  enrolledStudents: number;
  isActive: boolean;
  sections?: any[];
  assignments?: any[];
}

export interface CreateCourseData {
  code: string;
  name: string;
  credits: number;
  contactHours: number;
  program: string;
  department: string;
  semester: string;
  academicYear: string;
  requiresNightSection: boolean;
  room?: string;
  maxStudents: number;
  enrolledStudents: number;
}

class CourseService {
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/courses');
    return response.data;
  }

  async getCourseById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  }

  async getCoursesBySemester(semester: string, academicYear: string): Promise<Course[]> {
    const response = await api.get(`/courses/semester/${semester}/${academicYear}`);
    return response.data;
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data;
  }

  async updateCourse(id: string, data: Partial<CreateCourseData>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }
}

export const courseService = new CourseService();