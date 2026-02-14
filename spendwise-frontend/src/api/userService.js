import axiosConfig from './axiosConfig';

export const getUsers = async () => (await axiosConfig.get('/api/user')).data;
export const getUserById = async (id) => (await axiosConfig.get(`/api/user/${id}`)).data;
export const createUser = async (payload) => (await axiosConfig.post('/api/user', payload)).data;
export const updateUser = async (id, payload) => (await axiosConfig.put(`/api/user/${id}`, payload)).data;
export const updateUserBankBalance = async (id, bank_opening_balance) =>
  (await axiosConfig.patch(`/api/user/${id}/bank-balance`, { bank_opening_balance })).data;
export const deleteUser = async (id) => (await axiosConfig.delete(`/api/user/${id}`)).data;
