import api from './api';

export const getCropsByFarm = async (farmId) => {
  const response = await api.get(`/crops/farm/${farmId}`);
  return response.data;
};

export const createCrop = async (cropData) => {
  const response = await api.post('/crops', cropData);
  return response.data;
};

export const updateCrop = async (id, cropData) => {
  const response = await api.put(`/crops/${id}`, cropData);
  return response.data;
};

export const deleteCrop = async (id) => {
  const response = await api.delete(`/crops/${id}`);
  return response.data;
};

export const getAllCrops = async () => {
  const response = await api.get('/crops');
  return response.data;
};