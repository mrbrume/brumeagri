import api from './api';

export const markAttendance = async (attendanceData) => {
  const response = await api.post('/attendance', attendanceData);
  return response.data;
};

export const getTodayAttendance = async (farmId) => {
  const response = await api.get(`/attendance/farm/${farmId}`);
  return response.data;
};