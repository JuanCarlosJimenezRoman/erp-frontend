import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50' 
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
    }`;
  };

  const getDropdownClass = (basePath: string) => {
    const isActive = location.pathname.startsWith(basePath);
    return `px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50' 
        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Navigation */}
            <div className="flex items-center">
              {/* Logo/Title */}
              <Link 
                to={isAdmin ? "/dashboard" : "/inventory"} 
                className="text-xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
              >
                Sistema ERP
              </Link>

              {/* Navigation Links */}
              <nav className="flex space-x-1 ml-8">
                {/* Dashboard - Solo admin */}
                {isAdmin && (
                  <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                    Dashboard
                  </Link>
                )}

                {/* Usuarios - Admin o con permiso */}
                {(isAdmin || user?.permissions?.includes('users:read')) && (
                  <Link to="/users" className={getNavLinkClass('/users')}>
                    Usuarios
                  </Link>
                )}

                {/* Contabilidad - Admin o con permiso */}
                {(isAdmin || user?.permissions?.includes('contabilidad:read')) && (
                  <div className="relative group">
                    <button className={getDropdownClass('/accounting')}>
                      Contabilidad
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                      <Link to="/accounting" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📊 Dashboard</Link>
                      <Link to="/accounting/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🏦 Plan de Cuentas</Link>
                      <Link to="/accounting/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">💸 Transacciones</Link>
                      <Link to="/accounting/invoices" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🧾 Facturas</Link>
                    </div>
                  </div>
                )}

                {/* Inventario - Admin o con permiso */}
                {(isAdmin || user?.permissions?.includes('almacen:read')) && (
                  <div className="relative group">
                    <button className={getDropdownClass('/inventory')}>
                      Inventario
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                      <Link to="/inventory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📊 Dashboard</Link>
                      <Link to="/inventory/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📦 Productos</Link>
                      <Link to="/inventory/categories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📁 Categorías</Link>
                      <Link to="/inventory/suppliers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🏢 Proveedores</Link>
                      <Link to="/inventory/movements" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📈 Movimientos</Link>
                      <Link to="/inventory/alerts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🔔 Alertas</Link>
                    </div>
                  </div>
                )}
              </nav>
            </div>

            {/* Right side - User info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;