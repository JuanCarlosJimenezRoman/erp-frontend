import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardLayout from './components/layout/DashboardLayout';
import UsersPage from './pages/UsersPage';
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import AccountsPage from './pages/accounting/AccountsPage';
import TransactionsPage from './pages/accounting/TransactionsPage';
import InvoicesPage from './pages/accounting/InvoicesPage';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import ProductsPage from './pages/inventory/ProductsPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import SuppliersPage from './pages/inventory/SuppliersPage';
import AlertsPage from './pages/inventory/AlertsPage';
import MovementsPage from './pages/inventory/MovementsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AccountingDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/accounts"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AccountsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TransactionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting/invoices"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <InvoicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
            />
            <Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <InventoryDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory/products"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <ProductsPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory/categories"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <CategoriesPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory/suppliers"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <SuppliersPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory/movements"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <MovementsPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory/alerts"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <AlertsPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;