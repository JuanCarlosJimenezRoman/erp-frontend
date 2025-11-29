import { api } from './api';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

export const roleService = {
  getRoles: async (includeAdmin: boolean = true): Promise<Role[]> => {
    const response = await api.get(`/roles?includeAdmin=${includeAdmin}`);
    return response.data;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  }
};