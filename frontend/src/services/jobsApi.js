import api from './api';

export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const triggerAutomationRun = async (companyId = null) => {
  const payload = companyId ? { companyId } : {};
  const response = await api.post('/automation/run', payload);
  return response.data;
};

export const getAutomationLogs = async () => {
  const response = await api.get('/automation/logs');
  return response.data;
};
