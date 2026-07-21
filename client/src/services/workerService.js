import api from './api';

export const getWorkersByFarm = async (farmId) => {
  const response = await api.get(`/workers/farm/${farmId}`);
  return response.data;
};

export const createWorker = async (workerData) => {
  const response = await api.post('/workers', workerData);
  return response.data;
};

export const updateWorker = async (id, workerData) => {
  const response = await api.put(`/workers/${id}`, workerData);
  return response.data;
};

export const deleteWorker = async (id) => {
  const response = await api.delete(`/workers/${id}`);
  return response.data;
};