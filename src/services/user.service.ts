import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  password?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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