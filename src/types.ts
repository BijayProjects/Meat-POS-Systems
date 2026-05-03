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
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  date: number; // timestamp
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'purchase' | 'rent' | 'utility' | 'salary' | 'transport' | 'other';
  date: number; // timestamp
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
