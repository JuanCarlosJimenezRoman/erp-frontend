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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Sistema ERP</h1>
<nav className="flex space-x-4">
  <a
    href="/dashboard"
    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
  >
    Dashboard
  </a>
  {user?.permissions?.includes('users:read') && (
    <a
      href="/users"
      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
    >
      Usuarios
    </a>
  )}
</nav>
            </div>
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

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;