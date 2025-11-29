import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { roleService } from '../../services/role.service';
import type { CreateUserData, UpdateUserData, User } from '../../types/user';
import type { Role } from '../../services/role.service';

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User;
  onSave: (data: CreateUserData | UpdateUserData) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ mode, user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: ''
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const rolesData = await roleService.getRoles(true);
        setRoles(rolesData);
        
        if (mode === 'edit' && user) {
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            confirmPassword: '',
            roleId: user.roleId || ''
          });

          if (user.email === 'admin@erp.com') {
            setErrors(prev => ({
              ...prev,
              general: 'Usuario administrador principal - algunos cambios están restringidos'
            }));
          }
        }
      } catch (error) {
        console.error('Error inicializando formulario:', error);
      }
    };

    initializeForm();
  }, [mode, user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const saveData: any = {
        name: formData.name,
        email: formData.email,
        roleId: formData.roleId
      };

      if (mode === 'create') {
        saveData.password = formData.password;
      } else if (formData.password) {
        saveData.password = formData.password;
      }

      await onSave(saveData);
    } catch (error) {
      console.error('Error guardando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isAdminPrincipal = mode === 'edit' && user?.email === 'admin@erp.com';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
        {errors.general && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Aviso importante
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>{errors.general}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Juan Pérez"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: usuario@empresa.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              disabled={isAdminPrincipal}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.roleId ? 'border-red-500' : 'border-gray-300'
              } ${isAdminPrincipal ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccionar rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>
            )}
            {isAdminPrincipal && (
              <p className="text-gray-500 text-xs mt-1">
                El rol del administrador principal no puede ser modificado
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {mode === 'create' ? '*' : '(dejar en blanco para no cambiar)'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {formData.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Repetir contraseña"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;