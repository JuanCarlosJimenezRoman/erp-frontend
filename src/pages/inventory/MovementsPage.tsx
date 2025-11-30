import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Movement, Product, MovementType } from '../../types/inventory';
import MovementForm from '../../components/inventory/MovementForm';

const MovementsPage: React.FC = () => {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    productId: '',
    type: '' as MovementType | ''
  });

  useEffect(() => {
    loadMovements();
    loadProducts();
  }, [pagination.page, filters.productId, filters.type]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getMovements(
        pagination.page,
        pagination.limit,
        filters.productId || undefined,
        filters.type || undefined
      );
      setMovements(response.movements);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await inventoryService.getProducts();
      setProducts(productsData.products);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await inventoryService.createMovement(data);
      setShowForm(false);
      loadMovements();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando movimiento');
    }
  };

  const getTypeColor = (type: MovementType) => {
    const colors = {
      IN: 'bg-green-100 text-green-800',
      OUT: 'bg-red-100 text-red-800',
      ADJUSTMENT: 'bg-blue-100 text-blue-800'
    };
    return colors[type];
  };

  const getTypeLabel = (type: MovementType) => {
    const labels = {
      IN: 'Entrada',
      OUT: 'Salida',
      ADJUSTMENT: 'Ajuste'
    };
    return labels[type];
  };

  const getTypeIcon = (type: MovementType) => {
    const icons = {
      IN: '⬆️',
      OUT: '⬇️',
      ADJUSTMENT: '🔄'
    };
    return icons[type];
  };

  if (loading && movements.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
        {user?.permissions?.includes('almacen:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nuevo Movimiento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Producto:</label>
          <select
            value={filters.productId}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, productId: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>

          <label className="text-sm font-medium text-gray-700 ml-4">Tipo:</label>
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, type: e.target.value as MovementType | '' }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los tipos</option>
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>

          {(filters.productId || filters.type) && (
            <button
              onClick={() => {
                setFilters({ productId: '', type: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referencia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(movement.createdAt).toLocaleDateString('es-ES')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(movement.createdAt).toLocaleTimeString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {movement.product?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {movement.product?.sku}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{getTypeIcon(movement.type)}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(movement.type)}`}>
                      {getTypeLabel(movement.type)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${
                    movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{movement.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {movement.reference || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📈</div>
            <p className="text-gray-500 text-lg">
              {filters.productId || filters.type 
                ? 'No hay movimientos que coincidan con los filtros'
                : 'No hay movimientos registrados'
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
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Modal de creación */}
      {showForm && (
        <MovementForm
          products={products}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default MovementsPage;