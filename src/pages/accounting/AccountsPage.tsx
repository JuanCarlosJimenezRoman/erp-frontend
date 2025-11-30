import React, { useState, useEffect } from 'react';
import { accountingService } from '../../services/accounting.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Account, AccountType, CreateAccountData } from '../../types/accounting';
import AccountForm from '../../components/accounting/AccountForm';

const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [filterType, setFilterType] = useState<AccountType | 'ALL'>('ALL');

  useEffect(() => {
    loadAccounts();
  }, [filterType]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await accountingService.getAccounts(
        filterType !== 'ALL' ? filterType : undefined
      );
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateAccountData) => {
    try {
      await accountingService.createAccount(data);
      setShowForm(false);
      loadAccounts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando cuenta');
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateAccountData>) => {
    try {
      await accountingService.updateAccount(id, data);
      setEditingAccount(null);
      loadAccounts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando cuenta');
    }
  };

  const getTypeColor = (type: AccountType) => {
    const colors = {
      ASSET: 'bg-blue-100 text-blue-800',
      LIABILITY: 'bg-red-100 text-red-800',
      EQUITY: 'bg-green-100 text-green-800',
      INCOME: 'bg-purple-100 text-purple-800',
      EXPENSE: 'bg-orange-100 text-orange-800'
    };
    return colors[type];
  };

  const getTypeLabel = (type: AccountType) => {
    const labels = {
      ASSET: 'Activo',
      LIABILITY: 'Pasivo',
      EQUITY: 'Patrimonio',
      INCOME: 'Ingreso',
      EXPENSE: 'Gasto'
    };
    return labels[type];
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
        <h1 className="text-2xl font-bold text-gray-900">Plan de Cuentas</h1>
        {user?.permissions?.includes('contabilidad:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nueva Cuenta
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AccountType | 'ALL')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="ASSET">Activos</option>
            <option value="LIABILITY">Pasivos</option>
            <option value="EQUITY">Patrimonio</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
          </select>
        </div>
      </div>

      {/* Tabla de cuentas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
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
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(account.type)}`}>
                    {getTypeLabel(account.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{account.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {account.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user?.permissions?.includes('contabilidad:write') && (
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-900">
                    Ver Movimientos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">
              {filterType !== 'ALL' 
                ? `No hay cuentas de tipo ${getTypeLabel(filterType as AccountType)}`
                : 'No hay cuentas configuradas'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <AccountForm
          mode="create"
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingAccount && (
        <AccountForm
          mode="edit"
          account={editingAccount}
          onSave={(data) => handleUpdate(editingAccount.id, data)}
          onCancel={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
};

export default AccountsPage;