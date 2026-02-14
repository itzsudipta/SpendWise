import axiosConfig from './axiosConfig';

export const getExpenses = async () => (await axiosConfig.get('/api/expenses')).data;
export const getExpenseById = async (id) => (await axiosConfig.get(`/api/expenses/${id}`)).data;
export const getExpensesByUser = async (userId) => (await axiosConfig.get(`/api/expenses/user/${userId}`)).data;
export const getExpensesByCategory = async (categoryId) => (await axiosConfig.get(`/api/expenses/category/${categoryId}`)).data;
export const getExpenseDetails = async () => (await axiosConfig.get('/api/expenses/details/all')).data;
export const createExpense = async (payload) => (await axiosConfig.post('/api/expenses', payload)).data;
export const updateExpense = async (id, payload) => (await axiosConfig.put(`/api/expenses/${id}`, payload)).data;
export const deleteExpense = async (id) => (await axiosConfig.delete(`/api/expenses/${id}`)).data;