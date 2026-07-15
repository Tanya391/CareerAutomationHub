import api from './api';

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const createApplication = async (appData) => {
  const response = await api.post('/applications', appData);
  return response.data;
};

export const updateApplication = async (id, appData) => {
  const response = await api.put(`/applications/${id}`, appData);
  return response.data;
};
