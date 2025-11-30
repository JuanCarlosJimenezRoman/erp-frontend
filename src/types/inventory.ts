export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productsCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  productsCount?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  categoryId: string;
  supplierId?: string;
  minStock: number;
  maxStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  category?: Category;
  supplier?: Supplier;
  currentStock?: number;
}

export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  productId: string;
  createdBy: string;
  createdAt: string;
  product?: Product;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  type: AlertType;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  product?: Product;
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OVER_STOCK = 'OVER_STOCK',
  EXPIRING = 'EXPIRING'
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  categoryId: string;
  supplierId?: string;
  minStock: number;
  maxStock?: number;
}

export interface CreateMovementData {
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  productId: string;
}

export interface InventoryDashboard {
  totalProducts: number;
  lowStockItems: number;
  totalInventoryValue: number;
  recentMovements: Movement[];
  activeAlerts: InventoryAlert[];
  categorySummary: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalValue: number;
}

export interface StockLevel {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  status: 'LOW' | 'NORMAL' | 'OVER';
}