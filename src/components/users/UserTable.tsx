import React, { useState } from 'react';
import {type User } from '../../services/user.service';

interface UserTableProps {
  users: User[];
  currentUser: any;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onReactivate: (id: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number, search?: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onEdit,
  onDelete,
  onReactivate,
  pagination,
  onPageChange
}) => {
  const [showInactive, setShowInactive] = useState(false);
  const canEdit = currentUser?.permissions?.includes('users:write');
  const canDelete = currentUser?.permissions?.includes('users:delete');

  const filteredUsers = showInactive 
    ? users 
    : users.filter(user => user.isActive);

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-800',
      usuario: 'bg-blue-100 text-blue-800',
      contabilidad: 'bg-green-100 text-green-800',
      almacen: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'
      : 'bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium';
  };

  const getRowClass = (user: User) => {
    if (!user.isActive) {
      return 'bg-gray-50 text-gray-500';
    }
    return 'hover:bg-gray-50';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Filtros */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mostrar usuarios inactivos
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {filteredUsers.length} de {users.length} usuarios
            </span>
          </div>
          {showInactive && (
            <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-md">
              💡 Modo vista de usuarios inactivos
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={getRowClass(user)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        user.isActive ? 'bg-indigo-100' : 'bg-gray-200'
                      }`}>
                        <span className={`font-medium ${
                          user.isActive ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${
                        user.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${
                        user.isActive ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.isActive)}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {canEdit && user.isActive && (
                      <button
                        onClick={() => onEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    )}
                    
                    {canDelete && user.id !== currentUser?.id && (
                      <>
                        {user.isActive ? (
                          <button
                            onClick={() => onDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => onReactivate(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Reactivar
                          </button>
                        )}
                      </>
                    )}

                    {!user.isActive && canEdit && (
                      <button
                        onClick={() => onEdit(user)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar usuario inactivo"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">😴</div>
          <p className="text-gray-500 text-lg">
            {showInactive 
              ? 'No hay usuarios inactivos' 
              : 'No se encontraron usuarios activos'
            }
          </p>
        </div>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span> de{' '}
                <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;