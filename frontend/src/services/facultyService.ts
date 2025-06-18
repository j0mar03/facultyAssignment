import api from './api';

export interface Faculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'PartTime' | 'Temporary' | 'Designee';
  department: string;
  college: string;
  isActive: boolean;
  preferences?: any[];
  currentRegularLoad: number;
  currentExtraLoad: number;
  consecutiveLowRatings: number;
  fullName: string;
  assignments?: any[];
  sections?: any[];
  iteesHistory?: any[];
}

export interface CreateFacultyData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'PartTime' | 'Temporary' | 'Designee';
  department: string;
  college: string;
}

export interface LoadSummary {
  facultyId: string;
  regularLoad: number;
  extraLoad: number;
  totalLoad: number;
  maxRegularLoad: number;
  maxExtraLoad: number;
  hasExtraLoadRestriction: boolean;
}

export interface ITEESRecord {
  id: string;
  facultyId: string;
  semester: string;
  academicYear: string;
  rating: 'Outstanding' | 'Very Satisfactory' | 'Satisfactory' | 'Fair' | 'Poor';
  numericalScore: number;
  evaluatorCount?: number;
  comments?: string;
}

class FacultyService {
  async getAllFaculty(): Promise<Faculty[]> {
    const response = await api.get('/faculty');
    return response.data;
  }

  async getFacultyById(id: string): Promise<Faculty> {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  }

  async createFaculty(data: CreateFacultyData): Promise<Faculty> {
    const response = await api.post('/faculty', data);
    return response.data;
  }

  async updateFaculty(id: string, data: Partial<CreateFacultyData>): Promise<Faculty> {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  }

  async deleteFaculty(id: string): Promise<void> {
    await api.delete(`/faculty/${id}`);
  }

  async getFacultyLoadSummary(id: string): Promise<LoadSummary> {
    const response = await api.get(`/faculty/${id}/load-summary`);
    return response.data;
  }

  async addITEESRecord(facultyId: string, record: Omit<ITEESRecord, 'id' | 'facultyId'>): Promise<ITEESRecord> {
    const response = await api.post(`/faculty/${facultyId}/itees-record`, record);
    return response.data;
  }

  async getFacultyByDepartment(department: string): Promise<Faculty[]> {
    const response = await api.get('/faculty', { params: { department } });
    return response.data;
  }

  async getFacultyByType(type: string): Promise<Faculty[]> {
    const response = await api.get('/faculty', { params: { type } });
    return response.data;
  }
}

export const facultyService = new FacultyService();