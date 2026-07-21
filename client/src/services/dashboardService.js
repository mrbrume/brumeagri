import api from './api';

export const getDashboardSummary = async (farmId) => {
  const response = await api.get(`/dashboard/farm/${farmId}`);
  return response.data;
};

export const getMonthlyRevenue = async (farmId) => {
  const response = await api.get(`/sales/farm/${farmId}/monthly`);
  return response.data;
};

export const getMonthlyExpenses = async (farmId) => {
  const response = await api.get(`/expenses/farm/${farmId}/monthly`);
  return response.data;
};

export const getCropPerformance = async (farmId) => {
  const response = await api.get(`/crops/farm/${farmId}/performance`);
  return response.data;
};

export const getWeather = async (farmId) => {
  const response = await api.get(`/weather/farm/${farmId}`);
  return response.data;
};

export const getNotifications = async (farmId) => {
  const response = await api.get(`/notifications/farm/${farmId}`);
  return response.data;
};

export const getRecentActivity = async (farmId) => {
  const response = await api.get(`/activity/farm/${farmId}?limit=5`);
  return response.data;
};

export const getAttendanceSummary = async (farmId) => {
  const response = await api.get(`/attendance/farm/${farmId}/today`);
  return response.data;
};