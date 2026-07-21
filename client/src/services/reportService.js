import api from './api';

// Downloads a PDF report and triggers the browser's save dialog
const downloadReport = async (url, filename) => {
  const response = await api.get(url, { responseType: 'blob' });

  // Create a temporary link to trigger the browser download
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadSalesReport = (farmId) =>
  downloadReport(`/reports/farm/${farmId}/sales`, 'sales-report.pdf');

export const downloadExpenseReport = (farmId) =>
  downloadReport(`/reports/farm/${farmId}/expenses`, 'expense-report.pdf');

export const downloadInventoryReport = (farmId) =>
  downloadReport(`/reports/farm/${farmId}/inventory`, 'inventory-report.pdf');