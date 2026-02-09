// Expense Types
export type ExpenseCategory = 
  | 'stock_purchase' 
  | 'uber_delivery' 
  | 'salary' 
  | 'meta_ads' 
  | 'equipment' 
  | 'consumables' 
  | 'utilities' 
  | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  item: string;
  quantity: number;
  unit: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

// Stock Types
export type StockCategory = 'meat' | 'vegetable' | 'spice' | 'dairy' | 'grocery' | 'beverage' | 'other';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  currentQuantity: number;
  unit: string;
  minLevel: number;
  lastPurchased: string;
  lastPurchasePrice: number;
  notes?: string;
}

// Consumables Types
export type ConsumableCategory = 'packaging' | 'cleaning' | 'stationery' | 'other';

export interface ConsumableItem {
  id: string;
  name: string;
  category: ConsumableCategory;
  currentQuantity: number;
  unit: string;
  minLevel: number;
  lastPurchased: string;
  lastPurchasePrice: number;
}

// Revenue Types
export interface DailyRevenue {
  id: string;
  date: string;
  amount: number;
  source: 'online' | 'cash' | 'other';
  notes?: string;
}

// P&L Summary Types
export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: Record<ExpenseCategory, number>;
}

// Category Labels
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  stock_purchase: 'Stock Purchase',
  uber_delivery: 'Uber/Delivery',
  salary: 'Salaries',
  meta_ads: 'Meta Ads',
  equipment: 'Equipment',
  consumables: 'Consumables',
  utilities: 'Utilities',
  other: 'Other'
};

export const stockCategoryLabels: Record<StockCategory, string> = {
  meat: 'Meat',
  vegetable: 'Vegetables',
  spice: 'Spices',
  dairy: 'Dairy',
  grocery: 'Grocery',
  beverage: 'Beverages',
  other: 'Other'
};

export const consumableCategoryLabels: Record<ConsumableCategory, string> = {
  packaging: 'Packaging',
  cleaning: 'Cleaning',
  stationery: 'Stationery',
  other: 'Other'
};

// Common units
export const commonUnits = ['kg', 'g', 'pcs', 'ltr', 'ml', 'box', 'pack', 'bottle', 'can', 'dozen'];
