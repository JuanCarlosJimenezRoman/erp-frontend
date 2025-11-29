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