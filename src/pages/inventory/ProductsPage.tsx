import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, Category, Supplier } from '../../types/inventory';
import ProductForm from '../../components/inventory/ProductForm';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    categoryId: '',
    supplierId: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSuppliers();
  }, [pagination.page, filters.categoryId, filters.supplierId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getProducts(
        pagination.page,
        pagination.limit,
        filters.categoryId || undefined,
        filters.supplierId || undefined
      );
      setProducts(response.products);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await inventoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const suppliersData = await inventoryService.getSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await inventoryService.createProduct(data);
      setShowForm(false);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando producto');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await inventoryService.updateProduct(id, data);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando producto');
    }
  };

  const getStockStatus = (product: Product) => {
    const currentStock = product.currentStock || 0;
    if (currentStock <= product.minStock) return 'LOW';
    if (product.maxStock && currentStock > product.maxStock) return 'OVER';
    return 'NORMAL';
  };

  const getStockStatusColor = (status: string) => {
    const colors = {
      LOW: 'bg-red-100 text-red-800',
      NORMAL: 'bg-green-100 text-green-800',
      OVER: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusLabel = (status: string) => {
    const labels = {
      LOW: 'Bajo',
      NORMAL: 'Normal',
      OVER: 'Sobre Stock'
    };
    return labels[status as keyof typeof labels] || 'Desconocido';
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        {user?.permissions?.includes('almacen:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Categoría:</label>
          <select
            value={filters.categoryId}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, categoryId: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="text-sm font-medium text-gray-700 ml-4">Proveedor:</label>
          <select
            value={filters.supplierId}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, supplierId: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          {(filters.categoryId || filters.supplierId) && (
            <button
              onClick={() => {
                setFilters({ categoryId: '', supplierId: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
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
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500">{product.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.currentStock || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mín: {product.minStock} {product.maxStock && `Máx: ${product.maxStock}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${product.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Costo: ${product.cost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(stockStatus)}`}>
                      {getStockStatusLabel(stockStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {user?.permissions?.includes('almacen:write') && (
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        Movimientos
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">
              {filters.categoryId || filters.supplierId 
                ? 'No hay productos que coincidan con los filtros'
                : 'No hay productos registrados'
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

      {/* Modales */}
      {showForm && (
        <ProductForm
          mode="create"
          categories={categories}
          suppliers={suppliers}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          mode="edit"
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSave={(data) => handleUpdate(editingProduct.id, data)}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;