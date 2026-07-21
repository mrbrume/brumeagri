import api from './api';

export const getSystemStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAllFarms = async () => {
  const response = await api.get('/admin/farms');
  return response.data;
};