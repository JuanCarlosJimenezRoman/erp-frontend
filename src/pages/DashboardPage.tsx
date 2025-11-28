import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bienvenido al Sistema ERP
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Has iniciado sesión como: {user?.name}</p>
            <p>Rol: {user?.role}</p>
            <p>Email: {user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tarjetas de módulos según permisos */}
        {user?.permissions.includes('dashboard:read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Dashboard
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Vista General
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.permissions.includes('contabilidad:read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Contabilidad
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Módulo Financiero
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.permissions.includes('almacen:read') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Almacén
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Gestión de Inventario
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;