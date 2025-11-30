import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Sistema ERP</h1>

              {/* NAV LINKS */}
              <nav className="flex space-x-4 ml-6">

  {/* Solo Admin puede ver Dashboard principal */}
  {user?.role === 'admin' && (
    <a
      href="/dashboard"
      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
    >
      Dashboard
    </a>
  )}

  {/* Solo Admin ve Usuarios */}
  {user?.role === 'admin' && user?.permissions?.includes('users:read') && (
    <a
      href="/users"
      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
    >
      Usuarios
    </a>
  )}

  {/* Contabilidad (basado en permisos, no en rol) */}
  {user?.permissions?.includes('contabilidad:read') && (
    <div className="relative group">
      <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
        Contabilidad
        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <a href="/accounting" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          📊 Dashboard
        </a>
        <a href="/accounting/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          🏦 Plan de Cuentas
        </a>
        <a href="/accounting/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          💸 Transacciones
        </a>
        <a href="/accounting/invoices" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          🧾 Facturas
        </a>
      </div>
    </div>
  )}

</nav>

            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
