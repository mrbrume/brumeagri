import api from './api';

export const getExpensesByFarm = async (farmId, page = 1) => {
  const response = await api.get(`/expenses/farm/${farmId}?page=${page}&limit=20`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};