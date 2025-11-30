export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    accountId: string;
    invoiceId?: string;
    referenceId?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    account?: Account;
}

export interface Invoice {
    id: string;
    number: string;
    type: InvoiceType;
    date: string;
    dueDate?: string;
    clientName: string;
    clientEmail?: string;
    clientTaxId?: string;
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    note?: string;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
    transactions?: Transaction[];
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type TransactionType = 'DEBIT' | 'CREDIT';

export type InvoiceType = 'INCOME' | 'EXPENSE';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface CreateAccountData {
    code: string;
    name: string;
    type: AccountType;
    description?: string;
}

export interface CreateTransactionData {
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    accountId: string;
    referenceId?: string;
}

export interface CreateInvoiceData {
    number: string;
    type: InvoiceType;
    date: string;
    dueDate?: string;
    clientName: string;
    clientEmail?: string;
    clientTaxtId?: string;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    transactions: CreateTransactionData[];
}

export interface AccountingDashboard {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    accountsSummary: AccountSummary[];
    recentTransactions: Transaction[];
    pendingInvoices: number;
}

export interface AccountSummary{
    accountId: string;
    acoountName: string;
    balance: number;
    type: AccountType;
}