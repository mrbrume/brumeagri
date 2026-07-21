import api from './api';

export const getFarms = async () => {
  const response = await api.get('/farms');
  return response.data;
};

export const createFarm = async (farmData) => {
  const response = await api.post('/farms', farmData);
  return response.data;
};

export const updateFarm = async (id, farmData) => {
  const response = await api.put(`/farms/${id}`, farmData);
  return response.data;
};

export const deleteFarm = async (id) => {
  const response = await api.delete(`/farms/${id}`);
  return response.data;
};

export const addInvestorToFarm = async (farmId, email) => {
  const response = await api.post(`/farms/${farmId}/investors`, { email });
  return response.data;
};

export const addManagerToFarm = async (farmId, email) => {
  const response = await api.post(`/farms/${farmId}/managers`, { email });
  return response.data;
};

export const removeManagerFromFarm = async (farmId, userId) => {
  const response = await api.delete(`/farms/${farmId}/managers/${userId}`);
  return response.data;
};

export const removeInvestorFromFarm = async (farmId, userId) => {
  const response = await api.delete(`/farms/${farmId}/investors/${userId}`);
  return response.data;
};