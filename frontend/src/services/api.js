import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post("/auth/login", { email, password });
export const getCurrentUser = () => api.get("/auth/me");

// Jobs
export const getJobs = (filters = {}) => api.get("/jobs", { params: filters });
export const getJobById = (id) => api.get(`/jobs/${id}`);

// Resume
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getResumeStatus = () => api.get("/resume/status");
export const deleteResume = () => api.delete("/resume");

// Applications (user)
export const getApplications = () => api.get("/applications");
export const createApplication = (data) => api.post("/applications", data);
export const updateApplication = (id, data) => api.patch(`/applications/${id}`, data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);
export const getApplicationStats = () => api.get("/applications/stats");

// AI Assistant
export const chatWithAI = (message, sessionId = "default") => api.post("/ai/chat", { message, sessionId });
export const clearChat = (sessionId) => api.delete(`/ai/chat/${sessionId}`);

// Admin API
export const adminLogin = (email, password) => adminApi.post("/admin/login", { email, password });
export const getAdminProfile = () => adminApi.get("/admin/me");
export const getAdminJobs = () => adminApi.get("/admin/jobs");
export const getAdminJobById = (id) => adminApi.get(`/admin/jobs/${id}`);
export const createAdminJob = (data) => adminApi.post("/admin/jobs", data);
export const updateAdminJob = (id, data) => adminApi.put(`/admin/jobs/${id}`, data);
export const deleteAdminJob = (id) => adminApi.delete(`/admin/jobs/${id}`);
export const getAdminJobApplications = (id) => adminApi.get(`/admin/jobs/${id}/applications`);
export const getAdminApplications = () => adminApi.get("/admin/applications");
export const updateAdminApplicationStatus = (id, status) =>
  adminApi.put(`/admin/applications/${id}/status`, { status });

export default api;
export { adminApi };
