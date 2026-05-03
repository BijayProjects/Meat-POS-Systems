export type Category = 'meat' | 'egg' | 'veg';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: 'kg' | 'pcs';
  stock: number;
  minStock?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedUnit?: 'kg' | 'pcs' | 'g';
  manualAmount?: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  date: number; // timestamp
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'inventory' | 'operational' | 'other';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: number; // timestamp
  categoryId: string;
  categoryName: string;
  vendorName: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'digital';
  referenceNumber: string;
  description: string;
  receiptImage?: string;
  isInventory: boolean;
  productId?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  createdAt: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  change: number; // positive for purchase, negative for sale
  type: 'sale' | 'purchase' | 'adjustment';
  date: number;
  note?: string;
}
