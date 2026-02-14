import axiosConfig from './axiosConfig';

export const getBudgets = async () => (await axiosConfig.get('/api/budgets')).data;
export const getBudgetById = async (id) => (await axiosConfig.get(`/api/budgets/${id}`)).data;
export const getBudgetsByUser = async (userId) => (await axiosConfig.get(`/api/budgets/user/${userId}`)).data;
export const getBudgetByMonth = async (userId, month) =>
  (await axiosConfig.get(`/api/budgets/user/${userId}/month/${month}`)).data;
export const getBudgetSummary = async (userId, month) =>
  (await axiosConfig.get(`/api/budgets/user/${userId}/month/${month}/summary`)).data;
export const createBudget = async (payload) => (await axiosConfig.post('/api/budgets', payload)).data;
export const updateBudget = async (id, payload) => (await axiosConfig.put(`/api/budgets/${id}`, payload)).data;
export const deleteBudget = async (id) => (await axiosConfig.delete(`/api/budgets/${id}`)).data;