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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;