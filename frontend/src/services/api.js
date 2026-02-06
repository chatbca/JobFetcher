import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const getCurrentUser = () => 
  api.get('/auth/me');

// Jobs
export const getJobs = (filters = {}) => 
  api.get('/jobs', { params: filters });

export const getJobById = (id) => 
  api.get(`/jobs/${id}`);

// Resume
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getResumeStatus = () => 
  api.get('/resume/status');

export const deleteResume = () => 
  api.delete('/resume');

// Applications
export const getApplications = () => 
  api.get('/applications');

export const createApplication = (data) => 
  api.post('/applications', data);

export const updateApplication = (id, status) => 
  api.patch(`/applications/${id}`, { status });

export const deleteApplication = (id) => 
  api.delete(`/applications/${id}`);

export const getApplicationStats = () => 
  api.get('/applications/stats');

// AI Assistant
export const chatWithAI = (message, sessionId = 'default') => 
  api.post('/ai/chat', { message, sessionId });

export const clearChat = (sessionId) => 
  api.delete(`/ai/chat/${sessionId}`);

export default api;
