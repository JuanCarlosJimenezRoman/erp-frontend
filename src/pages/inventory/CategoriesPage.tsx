import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Category, CreateCategoryData } from '../../types/inventory';
import CategoryForm from '../../components/inventory/CategoryForm';

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Estado para el checkbox
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [showInactive]); // Se recarga cuando cambia el check

  const loadCategories = async () => {
    try {
      setLoading(true);
      // CORRECCIÓN PRINCIPAL: Pasamos el estado al servicio
      const categoriesData = await inventoryService.getCategories(showInactive);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateCategoryData) => {
    try {
      await inventoryService.createCategory(data);
      setShowForm(false);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando categoría');
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateCategoryData>) => {
    try {
      await inventoryService.updateCategory(id, data);
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando categoría');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
        // Confirmación opcional
      if (!window.confirm('¿Estás seguro de que deseas reactivar esta categoría?')) return;
      
      await inventoryService.updateCategory(id, { isActive: true });
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error reactivando categoría');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
        {user?.permissions?.includes('almacen:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nueva Categoría
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mostrar categorías inactivas
              </span>
            </label>
          </div>
          
          <div className="flex items-center gap-4">
             {showInactive && (
                <span className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-md border border-yellow-100">
                💡 Incluyendo inactivos
                </span>
            )}
            <span className="text-sm text-gray-500">
                Total: {categories.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos Activos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => {
              const isInactive = !category.isActive;
              return (
                <tr 
                    key={category.id} 
                    className={isInactive ? 'bg-gray-50' : 'hover:bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isInactive ? 'text-gray-400' : 'text-gray-900'}`}>
                      {category.productsCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {user?.permissions?.includes('almacen:write') && (
                        <>
                          <button
                            onClick={() => setEditingCategory(category)}
                            className={`${isInactive ? 'text-gray-400 hover:text-gray-600' : 'text-indigo-600 hover:text-indigo-900'}`}
                          >
                            Editar
                          </button>
                          
                          {/* Botón explícito para reactivar */}
                          {isInactive && (
                            <button
                              onClick={() => handleReactivate(category.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                              title="Reactivar categoría"
                            >
                              Reactivar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">
              {showInactive 
                ? 'No se encontraron categorías' 
                : 'No hay categorías activas registradas'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <CategoryForm
          mode="create"
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          mode="edit"
          category={editingCategory}
          onSave={(data) => handleUpdate(editingCategory.id, data)}
          onCancel={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;