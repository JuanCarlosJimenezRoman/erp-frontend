import { api } from './api';
import type { User, CreateUserData, UpdateUserData, UsersResponse } from '../types/user';

export const userService = {
  getUsers: async (page = 1, limit = 10, search = ''): Promise<UsersResponse> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserData): Promise<{ message: string; user: User }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<{ message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (userData: UpdateUserData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/users/profile');
    return response.data;
  }
};