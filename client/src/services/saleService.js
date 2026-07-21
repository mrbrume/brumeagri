import api from './api';

export const getSalesByFarm = async (farmId, page = 1) => {
  const response = await api.get(`/sales/farm/${farmId}?page=${page}&limit=20`);
  return response.data;
};

export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const deleteSale = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return response.data;
};