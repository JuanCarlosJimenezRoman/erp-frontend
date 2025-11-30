import { api } from './api';
import type {
  Account,
  Transaction,
  Invoice,
  CreateAccountData,
  CreateTransactionData,
  CreateInvoiceData,
  AccountingDashboard,
  AccountType,
  TransactionType,
  InvoiceType,
  InvoiceStatus
} from '../types/accounting';

export const accountingService = {
  // Dashboard
  getDashboard: async (): Promise<AccountingDashboard> => {
    const response = await api.get('/accounting/dashboard');
    return response.data;
  },

  // Cuentas
  getAccounts: async (type?: AccountType): Promise<Account[]> => {
    const url = type ? `/accounting/accounts?type=${type}` : '/accounting/accounts';
    const response = await api.get(url);
    return response.data;
  },

  getAccount: async (id: string): Promise<Account> => {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: CreateAccountData): Promise<Account> => {
    const response = await api.post('/accounting/accounts', data);
    return response.data;
  },

  updateAccount: async (id: string, data: Partial<CreateAccountData>): Promise<Account> => {
    const response = await api.put(`/accounting/accounts/${id}`, data);
    return response.data;
  },

  // Transacciones
  getTransactions: async (page = 1, limit = 20, accountId?: string): Promise<{ transactions: Transaction[]; pagination: any }> => {
    const url = accountId 
      ? `/accounting/transactions?page=${page}&limit=${limit}&accountId=${accountId}`
      : `/accounting/transactions?page=${page}&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  },

  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await api.post('/accounting/transactions', data);
    return response.data;
  },

  // Facturas
  getInvoices: async (page = 1, limit = 20, type?: InvoiceType, status?: InvoiceStatus): Promise<{ invoices: Invoice[]; pagination: any }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await api.get(`/accounting/invoices?${params}`);
    return response.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/accounting/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await api.post('/accounting/invoices', data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    const response = await api.patch(`/accounting/invoices/${id}/status`, { status });
    return response.data;
  },

  // Reportes
  getIncomeStatement: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get(`/accounting/reports/income-statement?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getBalanceSheet: async (date: string): Promise<any> => {
    const response = await api.get(`/accounting/reports/balance-sheet?date=${date}`);
    return response.data;
  }
};