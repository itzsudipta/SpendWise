import axiosConfig from './axiosConfig';

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadLiveMonthlyReport = async (userId, month) => {
  const response = await axiosConfig.get('/api/reports/monthly/live', {
    params: { user_id: userId, month },
    responseType: 'blob',
  });
  triggerDownload(response.data, `SpendWise_Live_Report_User_${userId}_${month}.pdf`);
};

export const downloadAutoMonthlyReport = async (userId, month) => {
  const response = await axiosConfig.get('/api/reports/monthly/auto', {
    params: { user_id: userId, month },
    responseType: 'blob',
  });
  triggerDownload(response.data, `SpendWise_Auto_Report_User_${userId}_${month}.pdf`);
};

export const generateAutoMonthlyReport = async (userId, month) =>
  (await axiosConfig.post('/api/reports/monthly/auto/generate', { user_id: userId, month })).data;
