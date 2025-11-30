import React, { useState, useEffect } from 'react';
import { accountingService } from '../../services/accounting.service';
import { useAuth } from '../../contexts/AuthContext';
import type { AccountingDashboard } from '../../types/accounting';


const AccountingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AccountingDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await accountingService.getDashboard();
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Contable</h1>
        <div className="text-sm text-gray-500">
          Actualizado: {new Date().toLocaleDateString('es-ES')}
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos del Mes</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboard.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">📉</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gastos del Mes</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboard.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Utilidad Neta</p>
              <p className={`text-2xl font-semibold ${
                dashboard.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${dashboard.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">📄</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Facturas Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard.pendingInvoices}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de cuentas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resumen de Cuentas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.accountsSummary.slice(0, 5).map((account) => (
                <div key={account.accountId} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                    <p className="text-sm text-gray-500">{account.type}</p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {dashboard.accountsSummary.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                  Ver todas las cuentas →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transacciones recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Transacciones Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.account.name} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${
                    transaction.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'DEBIT' ? '-' : '+'}${transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            {dashboard.recentTransactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay transacciones recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;


