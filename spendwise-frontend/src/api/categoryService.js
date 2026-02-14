import axiosConfig from './axiosConfig';

export const getCategories = async () => (await axiosConfig.get('/api/categories')).data;
export const getCategoryById = async (id) => (await axiosConfig.get(`/api/categories/${id}`)).data;
export const getCategoriesByUser = async (userId) => (await axiosConfig.get(`/api/categories/user/${userId}`)).data;
export const createCategory = async (payload) => (await axiosConfig.post('/api/categories', payload)).data;
export const updateCategory = async (id, payload) => (await axiosConfig.put(`/api/categories/${id}`, payload)).data;
export const deleteCategory = async (id) => (await axiosConfig.delete(`/api/categories/${id}`)).data;