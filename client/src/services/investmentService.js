import api from './api';

export const getMyInvestmentSummary = async (farmId) => {
  const response = await api.get(`/investments/farm/${farmId}/summary`);
  return response.data;
};

export const getFarmInvestments = async (farmId) => {
  const response = await api.get(`/investments/farm/${farmId}`);
  return response.data;
};

export const createInvestment = async (investmentData) => {
  const response = await api.post('/investments', investmentData);
  return response.data;
};