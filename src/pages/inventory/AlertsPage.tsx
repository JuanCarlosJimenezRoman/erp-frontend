import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventory.service';
import { useAuth } from '../../contexts/AuthContext';
import type { InventoryAlert, AlertType } from '../../types/inventory';

const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [showResolved]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const alertsData = await inventoryService.getAlerts(showResolved);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await inventoryService.resolveAlert(id);
      loadAlerts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error resolviendo alerta');
    }
  };

  const getAlertColor = (type: AlertType) => {
    const colors = {
      LOW_STOCK: 'bg-red-100 text-red-800 border-red-200',
      OVER_STOCK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      EXPIRING: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type];
  };

  const getAlertIcon = (type: AlertType) => {
    const icons = {
      LOW_STOCK: '⚠️',
      OVER_STOCK: '📦',
      EXPIRING: '⏰'
    };
    return icons[type];
  };

  const getAlertTitle = (type: AlertType) => {
    const titles = {
      LOW_STOCK: 'Stock Bajo',
      OVER_STOCK: 'Sobre Stock',
      EXPIRING: 'Próximo a Vencer'
    };
    return titles[type];
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
        <h1 className="text-2xl font-bold text-gray-900">Alertas de Inventario</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Mostrar alertas resueltas
            </span>
          </label>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getAlertColor(alert.type)} ${
              alert.isResolved ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-xl">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold">
                      {getAlertTitle(alert.type)}
                    </h3>
                    {alert.isResolved && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Resuelta
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">
                    <strong>{alert.product?.name}</strong> ({alert.product?.sku})
                  </p>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Creada: {new Date(alert.createdAt).toLocaleString('es-ES')}
                    {alert.resolvedAt && (
                      <span className="ml-4">
                        Resuelta: {new Date(alert.resolvedAt).toLocaleString('es-ES')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {!alert.isResolved && user?.permissions?.includes('almacen:write') && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-300 transition-colors"
                >
                  Marcar como Resuelta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">✅</div>
          <p className="text-gray-500 text-lg">
            {showResolved 
              ? 'No hay alertas resueltas' 
              : '¡No hay alertas activas! Todo está bajo control.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;