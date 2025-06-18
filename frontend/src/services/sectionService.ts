import api from './api';

export interface Section {
  id: string;
  sectionCode: string;
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  faculty?: {
    id: string;
    fullName: string;
  };
  status: 'Planning' | 'Assigned' | 'Active' | 'Completed' | 'Cancelled';
  classType: 'Regular' | 'Laboratory' | 'Lecture' | 'Combined';
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledStudents: number;
  room?: string;
  timeSlots?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  isNightSection: boolean;
  hasConflicts?: boolean;
  conflicts?: any[];
}

export interface CreateSectionData {
  sectionCode: string;
  courseId: string;
  facultyId?: string;
  status: string;
  classType: string;
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledStudents: number;
  room?: string;
  timeSlots?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  isNightSection: boolean;
  notes?: string;
}

export interface SectionFilters {
  semester?: string;
  academicYear?: string;
  courseId?: string;
  facultyId?: string;
  status?: string;
  unassigned?: string;
  hasConflicts?: string;
}

export interface SectionsOverview {
  summary: {
    totalSections: number;
    assignedSections: number;
    unassignedSections: number;
    nightSections: number;
    assignedNightSections: number;
    conflictCount: number;
    assignmentRate: number;
    nightAssignmentRate: number;
  };
  courseGrouping: any;
  unassignedSections: any[];
}

class SectionService {
  async getAllSections(filters?: SectionFilters): Promise<Section[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
    }
    
    const response = await api.get(`/sections?${params.toString()}`);
    return response.data;
  }

  async getSectionById(id: string): Promise<Section> {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  }

  async createSection(data: CreateSectionData): Promise<Section> {
    const response = await api.post('/sections', data);
    return response.data;
  }

  async updateSection(id: string, data: Partial<CreateSectionData>): Promise<Section> {
    const response = await api.put(`/sections/${id}`, data);
    return response.data;
  }

  async deleteSection(id: string): Promise<void> {
    await api.delete(`/sections/${id}`);
  }

  async getSectionsOverview(filters?: { semester?: string; academicYear?: string }): Promise<SectionsOverview> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
    }
    
    const response = await api.get(`/sections/overview?${params.toString()}`);
    return response.data;
  }

  async assignFacultyToSection(sectionId: string, facultyId: string, room?: string): Promise<any> {
    const response = await api.post(`/sections/${sectionId}/assign-faculty`, { 
      facultyId,
      room 
    });
    return response.data;
  }

  async unassignFacultyFromSection(sectionId: string): Promise<any> {
    const response = await api.post(`/sections/${sectionId}/unassign-faculty`);
    return response.data;
  }

  async checkSectionConflicts(sectionId: string): Promise<any> {
    const response = await api.get(`/sections/${sectionId}?hasConflicts=true`);
    return response.data;
  }
}

export const sectionService = new SectionService();