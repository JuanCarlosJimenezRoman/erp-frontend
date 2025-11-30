import React, { useState, useEffect } from 'react';
import { accountingService } from '../../services/accounting.service';
import type { Account, CreateInvoiceData, CreateTransactionData, InvoiceType } from '../../types/accounting';

interface InvoiceFormProps {
  onSave: (data: CreateInvoiceData) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSave, onCancel }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    number: '',
    type: 'INCOME' as InvoiceType,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: '',
    clientEmail: '',
    clientTaxId: '',
    subtotal: '',
    tax: '',
    total: '',
    notes: '',
    transactions: [] as CreateTransactionData[]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = await accountingService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
    }
  };

  // Calcular automáticamente el total cuando cambia subtotal o impuesto
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const tax = parseFloat(formData.tax) || 0;
    const total = subtotal + tax;
    
    if (!isNaN(total)) {
      setFormData(prev => ({
        ...prev,
        total: total.toFixed(2)
      }));
    }
  }, [formData.subtotal, formData.tax]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.number.trim()) {
      newErrors.number = 'El número de factura es requerido';
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente/proveedor es requerido';
    }

    if (!formData.subtotal || parseFloat(formData.subtotal) <= 0) {
      newErrors.subtotal = 'El subtotal debe ser mayor a 0';
    }

    if (!formData.tax || parseFloat(formData.tax) < 0) {
      newErrors.tax = 'El impuesto no puede ser negativo';
    }

    if (!formData.total || parseFloat(formData.total) <= 0) {
      newErrors.total = 'El total debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear transacciones automáticas basadas en el tipo de factura
      const transactions: CreateTransactionData[] = [];

      if (formData.type === 'INCOME') {
        // Para factura de ingreso (venta): débito en caja/bancos, crédito en ingresos
        const incomeAccount = accounts.find(acc => acc.type === 'INCOME');
        const assetAccount = accounts.find(acc => acc.type === 'ASSET');
        
        if (incomeAccount && assetAccount) {
          transactions.push(
            {
              date: new Date(formData.date).toISOString(),
              description: `Venta - ${formData.clientName}`,
              amount: parseFloat(formData.total),
              type: 'DEBIT',
              accountId: assetAccount.id,
              reference: formData.number
            },
            {
              date: new Date(formData.date).toISOString(),
              description: `Ingreso por venta - ${formData.clientName}`,
              amount: parseFloat(formData.total),
              type: 'CREDIT',
              accountId: incomeAccount.id,
              reference: formData.number
            }
          );
        }
      } else {
        // Para factura de gasto (compra): débito en gastos, crédito en cuentas por pagar
        const expenseAccount = accounts.find(acc => acc.type === 'EXPENSE');
        const liabilityAccount = accounts.find(acc => acc.type === 'LIABILITY');
        
        if (expenseAccount && liabilityAccount) {
          transactions.push(
            {
              date: new Date(formData.date).toISOString(),
              description: `Compra - ${formData.clientName}`,
              amount: parseFloat(formData.total),
              type: 'DEBIT',
              accountId: expenseAccount.id,
              reference: formData.number
            },
            {
              date: new Date(formData.date).toISOString(),
              description: `Cuenta por pagar - ${formData.clientName}`,
              amount: parseFloat(formData.total),
              type: 'CREDIT',
              accountId: liabilityAccount.id,
              reference: formData.number
            }
          );
        }
      }

      const invoiceData: CreateInvoiceData = {
        number: formData.number,
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        clientTaxId: formData.clientTaxId || undefined,
        subtotal: parseFloat(formData.subtotal),
        tax: parseFloat(formData.tax),
        total: parseFloat(formData.total),
        notes: formData.notes || undefined,
        transactions
      };

      await onSave(invoiceData);
    } catch (error) {
      console.error('Error guardando factura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const number = `FAC-${timestamp}-${random}`;
    setFormData(prev => ({ ...prev, number }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nueva Factura</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Factura *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="FAC-001"
                />
                <button
                  type="button"
                  onClick={generateInvoiceNumber}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  Generar
                </button>
              </div>
              {errors.number && (
                <p className="text-red-500 text-xs mt-1">{errors.number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INCOME">Factura de Ingreso (Venta)</option>
                <option value="EXPENSE">Factura de Gasto (Compra)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Emisión *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Información del cliente/proveedor */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Información del {formData.type === 'INCOME' ? 'Cliente' : 'Proveedor'}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre/Razón Social *
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.clientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.type === 'INCOME' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                />
                {errors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUC/NIT/ID
                  </label>
                  <input
                    type="text"
                    name="clientTaxId"
                    value={formData.clientTaxId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Número de identificación tributaria"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Montos */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Montos</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal *
                </label>
                <input
                  type="number"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.subtotal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.subtotal && (
                  <p className="text-red-500 text-xs mt-1">{errors.subtotal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impuesto *
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.tax ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.tax && (
                  <p className="text-red-500 text-xs mt-1">{errors.tax}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total *
                </label>
                <input
                  type="number"
                  name="total"
                  value={formData.total}
                  readOnly
                  className={`w-full px-3 py-2 border rounded-md bg-gray-50 ${
                    errors.total ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.total && (
                  <p className="text-red-500 text-xs mt-1">{errors.total}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas/Observaciones
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Información de transacciones automáticas */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Transacciones Automáticas
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {formData.type === 'INCOME' 
                    ? 'Al guardar, se crearán automáticamente: Débito en Caja/Bancos y Crédito en Ingresos'
                    : 'Al guardar, se crearán automáticamente: Débito en Gastos y Crédito en Cuentas por Pagar'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;