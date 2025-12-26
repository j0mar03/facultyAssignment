import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (invalid/expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Dispatch a custom event that the App component can listen to
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Faculty API
export const getFaculty = async () => {
  const response = await api.get('/faculty');
  return response.data;
};

export const getFacultyById = async (id: string) => {
  const response = await api.get(`/faculty/${id}`);
  return response.data;
};

export const createFaculty = async (data: any) => {
  const response = await api.post('/faculty', data);
  return response.data;
};

export const updateFaculty = async (id: string, data: any) => {
  const response = await api.put(`/faculty/${id}`, data);
  return response.data;
};

export const deleteFaculty = async (id: string) => {
  const response = await api.delete(`/faculty/${id}`);
  return response.data;
};

export const forceDeleteFaculty = async (id: string) => {
  const response = await api.delete(`/faculty/${id}/force`);
  return response.data;
};

// Course API
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const createCourse = async (data: any) => {
  const response = await api.post('/courses', data);
  return response.data;
};

// Assignment API
export const getAssignments = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const createAssignment = async (data: any) => {
  const response = await api.post('/assignments', data);
  return response.data;
};

export const validateAssignment = async (data: any) => {
  const response = await api.post('/assignments/validate', data);
  return response.data;
};

export const approveAssignment = async (id: string) => {
  const response = await api.post(`/assignments/${id}/approve`);
  return response.data;
};

export const updateAssignment = async (id: string, data: any) => {
  const response = await api.put(`/assignments/${id}`, data);
  return response.data;
};

// Schedule API
export const generateSchedule = async (data: any) => {
  const response = await api.post('/schedule/generate', data);
  return response.data;
};

export const getScheduleCalendar = async () => {
  const response = await api.get('/schedule/calendar');
  return response.data;
};

export const getFacultyCalendar = async (facultyId?: string) => {
  const url = facultyId ? `/schedule/faculty/${facultyId}/calendar` : '/schedule/calendar';
  const response = await api.get(url);
  return response.data;
};

export const checkScheduleConflicts = async () => {
  const response = await api.get('/schedule/conflicts');
  return response.data;
};

// Dashboard API
export const fetchDashboardData = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

// Section API
export const getSections = async () => {
  const response = await api.get('/sections');
  return response.data;
};

export const getSectionById = async (id: string) => {
  const response = await api.get(`/sections/${id}`);
  return response.data;
};

export const createSection = async (data: any) => {
  const response = await api.post('/sections', data);
  return response.data;
};

export const updateSection = async (id: string, data: any) => {
  const response = await api.put(`/sections/${id}`, data);
  return response.data;
};

export const deleteSection = async (id: string) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

export const getSectionsOverview = async () => {
  const response = await api.get('/sections/overview');
  return response.data;
};

// Reports API
export const getLoadDistributionReport = async () => {
  const response = await api.get('/reports/load-distribution');
  return response.data;
};

export const getComplianceReport = async () => {
  const response = await api.get('/reports/compliance');
  return response.data;
};

export const exportMonitoringSheet = async () => {
  const response = await api.get('/reports/export/monitoring-sheet', {
    responseType: 'blob',
  });
  return response.data;
};

export default api;