import React, { useState, useEffect } from 'react';
import { accountingService } from '../../services/accounting.service';
import { useAuth } from '../../contexts/AuthContext';
import type { Invoice, InvoiceType, InvoiceStatus } from '../../types/accounting';
import InvoiceForm from '../../components/accounting/InvoiceForm';

const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    type: '' as InvoiceType | '',
    status: '' as InvoiceStatus | ''
  });

  useEffect(() => {
    loadInvoices();
  }, [pagination.page, filters.type, filters.status]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await accountingService.getInvoices(
        pagination.page,
        pagination.limit,
        filters.type || undefined,
        filters.status || undefined
      );
      setInvoices(response.invoices);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Error cargando facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await accountingService.createInvoice(data);
      setShowForm(false);
      loadInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando factura');
    }
  };

  const handleStatusUpdate = async (id: string, status: InvoiceStatus) => {
    try {
      await accountingService.updateInvoiceStatus(id, status);
      loadInvoices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error actualizando estado');
    }
  };

  const getTypeColor = (type: InvoiceType) => {
    return type === 'INCOME' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getTypeLabel = (type: InvoiceType) => {
    return type === 'INCOME' ? 'Ingreso (Venta)' : 'Gasto (Compra)';
  };

  const getStatusColor = (status: InvoiceStatus) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ISSUED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    const labels = {
      DRAFT: 'Borrador',
      ISSUED: 'Emitida',
      PAID: 'Pagada',
      CANCELLED: 'Cancelada'
    };
    return labels[status];
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
        {user?.permissions?.includes('contabilidad:write') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Nueva Factura
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Tipo:</label>
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, type: e.target.value as InvoiceType | '' }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los tipos</option>
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Gasto</option>
          </select>

          <label className="text-sm font-medium text-gray-700 ml-4">Estado:</label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, status: e.target.value as InvoiceStatus | '' }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="ISSUED">Emitida</option>
            <option value="PAID">Pagada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente/Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
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
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.number}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.clientName}
                  </div>
                  {invoice.clientEmail && (
                    <div className="text-sm text-gray-500">
                      {invoice.clientEmail}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(invoice.type)}`}>
                    {getTypeLabel(invoice.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ${invoice.total.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Ver
                    </button>
                    {user?.permissions?.includes('contabilidad:write') && (
                      <>
                        {invoice.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusUpdate(invoice.id, 'ISSUED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Emitir
                          </button>
                        )}
                        {invoice.status === 'ISSUED' && (
                          <button
                            onClick={() => handleStatusUpdate(invoice.id, 'PAID')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Marcar Pagada
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🧾</div>
            <p className="text-gray-500 text-lg">No hay facturas registradas</p>
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> de{' '}
                  <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showForm && (
        <InvoiceForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default InvoicesPage;