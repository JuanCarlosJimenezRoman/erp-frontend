import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../../contexts/AuthContext';
import type { InventoryDashboard } from '../../types/inventory';

const InventoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await inventoryService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error cargando el dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Inventario</h1>
        <div className="text-sm text-gray-500">
          Actualizado: {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Valor Inventario</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboard.totalInventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">🔔</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard.activeAlerts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen por categoría */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Inventario por Categoría</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.categorySummary.map((category) => (
                <div key={category.categoryId} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.categoryName}</p>
                    <p className="text-sm text-gray-500">{category.productCount} productos</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    ${category.totalValue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {dashboard.categorySummary.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay categorías con productos</p>
            )}
          </div>
        </div>

        {/* Movimientos recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Movimientos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.recentMovements.map((movement) => (
                <div key={movement.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {movement.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {movement.reason} • {new Date(movement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                  </p>
                </div>
              ))}
            </div>
            {dashboard.recentMovements.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay movimientos recientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Alertas activas */}
      {dashboard.activeAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Alertas Activas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboard.activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      {alert.product.name} ({alert.product.sku})
                    </p>
                    <p className="text-sm text-yellow-700">
                      {alert.message}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;