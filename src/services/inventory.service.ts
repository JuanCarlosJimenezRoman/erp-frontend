import { api } from './api';
import type {
  Category,
  Supplier,
  Product,
  Movement,
  InventoryAlert,
  CreateCategoryData,
  CreateSupplierData,
  CreateProductData,
  CreateMovementData,
  InventoryDashboard,
  StockLevel,
  MovementType,
} from '../types/inventory';

export const inventoryService = {
  // Dashboard
  getDashboard: async (): Promise<InventoryDashboard> => {
    const response = await api.get('/inventory/dashboard');
    return response.data;
  },

  // Categorías
  getCategories: async (includeInactive: boolean = false): Promise<Category[]> => {
    const response = await api.get(`/inventory/categories?includeInactive=${includeInactive}`);
    return response.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get(`/inventory/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post('/inventory/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CreateCategoryData>): Promise<Category> => {
    const response = await api.put(`/inventory/categories/${id}`, data);
    return response.data;
  },

  // Proveedores
  getSuppliers: async (includeInactive: boolean = false): Promise<Supplier[]> => {
    const response = await api.get(`/inventory/suppliers?includeInactive=${includeInactive}`);
    return response.data;
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/inventory/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await api.post('/inventory/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: string, data: Partial<CreateSupplierData>): Promise<Supplier> => {
    const response = await api.put(`/inventory/suppliers/${id}`, data);
    return response.data;
  },

  // Productos
getProducts: async (
  page = 1, 
  limit = 20, 
  categoryId?: string, 
  supplierId?: string, 
  includeInactive: boolean = false
): Promise<{ products: Product[]; pagination: any }> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('includeInactive', includeInactive.toString());
  if (categoryId) params.append('categoryId', categoryId);
  if (supplierId) params.append('supplierId', supplierId);
  
  const response = await api.get(`/inventory/products?${params}`);
  return response.data;
},

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/inventory/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post('/inventory/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await api.put(`/inventory/products/${id}`, data);
    return response.data;
  },

  // Movimientos
  getMovements: async (page = 1, limit = 20, productId?: string, type?: MovementType): Promise<{ movements: Movement[]; pagination: any }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (productId) params.append('productId', productId);
    if (type) params.append('type', type);
    
    const response = await api.get(`/inventory/movements?${params}`);
    return response.data;
  },

  createMovement: async (data: CreateMovementData): Promise<Movement> => {
    const response = await api.post('/inventory/movements', data);
    return response.data;
  },

  // Alertas
  getAlerts: async (resolved?: boolean): Promise<InventoryAlert[]> => {
    const url = resolved !== undefined ? `/inventory/alerts?resolved=${resolved}` : '/inventory/alerts';
    const response = await api.get(url);
    return response.data;
  },

  resolveAlert: async (id: string): Promise<InventoryAlert> => {
    const response = await api.patch(`/inventory/alerts/${id}/resolve`);
    return response.data;
  },

  // Reportes
  getStockLevels: async (): Promise<StockLevel[]> => {
    const response = await api.get('/inventory/reports/stock-levels');
    return response.data;
  },

  getLowStockItems: async (): Promise<Product[]> => {
    const response = await api.get('/inventory/reports/low-stock');
    return response.data;
  }
  
};

//comentario de prueba