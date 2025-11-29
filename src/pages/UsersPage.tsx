import React, { useState, useEffect } from 'react';
import type { User, CreateUserData, UpdateUserData } from '../types/user';
import UserTable from '../components/users/UserTable';
import UserForm from '../components/users/UserForm';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');

  const loadUsers = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await userService.getUsers(page, 10, searchTerm);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (userData: CreateUserData) => {
    try {
      await userService.createUser(userData);
      setShowForm(false);
      loadUsers(pagination.page, search);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando usuario');
    }
  };

  const handleUpdate = async (id: string, userData: UpdateUserData) => {
    try {
      await userService.updateUser(id, userData);
      setEditingUser(null);
      loadUsers(pagination.page, search);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      loadUsers(pagination.page, search);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error desactivando usuario');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, search);
  };

  const handleReactivate = async (id: string) => {
  if (!window.confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
    return;
  }

  try {
    await userService.updateUser(id, { isActive: true });
    loadUsers(pagination.page, search);
  } catch (error: any) {
    alert(error.response?.data?.message || 'Error reactivando usuario');
  }
};

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        {currentUser?.permissions?.includes('users:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              loadUsers(1, '');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Tabla de usuarios */}
      <UserTable
        users={users}
        currentUser={currentUser}
        onEdit={setEditingUser}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
        pagination={pagination}
        onPageChange={loadUsers}
      />

      {/* Modales */}
      {showForm && (
        <UserForm
          mode="create"
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingUser && (
        <UserForm
          mode="edit"
          user={editingUser}
          onSave={(data) => handleUpdate(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;