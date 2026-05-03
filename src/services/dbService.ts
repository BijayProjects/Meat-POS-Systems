import { 
  collection, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Sale, Expense } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // Products
  async getProducts() {
    const path = 'products';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeProducts(callback: (products: Product[]) => void) {
    const path = 'products';
    const q = query(collection(db, path), orderBy('name'));
    return onSnapshot(q, 
      (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, path)
    );
  },

  async addProduct(product: Omit<Product, 'id'>) {
    const path = 'products';
    try {
      const sanitized = Object.fromEntries(Object.entries(product).filter(([_, v]) => v !== undefined));
      return await addDoc(collection(db, path), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const path = `products/${id}`;
    try {
      const sanitized = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteProduct(id: string) {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sales
  async addSale(sale: Omit<Sale, 'id'>) {
    const path = 'sales';
    try {
      const batch = writeBatch(db);
      
      // Sanitization to remove 'undefined' values which Firestore doesn't support
      const sanitizeItem = (item: any) => {
        const sanitized: any = {};
        Object.keys(item).forEach(key => {
          if (item[key] !== undefined) {
            sanitized[key] = item[key];
          }
        });
        return sanitized;
      };

      const sanitizedSale = {
        ...sale,
        items: sale.items.map(sanitizeItem)
      };

      // 1. Create Sale Document
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, sanitizedSale);

      // 2. Update Product Stock
      sale.items.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        let stockChange = item.quantity;
        
        // Normalize quantity if selected unit (e.g. grams) differs from base unit (e.g. kg)
        if (item.selectedUnit === 'g' && item.unit === 'kg') {
          stockChange = item.quantity / 1000;
        }

        batch.update(productRef, {
          stock: increment(-stockChange)
        });
      });

      await batch.commit();
      return saleRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeSales(callback: (sales: Sale[]) => void) {
    const path = 'sales';
    const q = query(collection(db, path), orderBy('date', 'desc'));
    return onSnapshot(q,
      (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, path)
    );
  },

  // Expenses
  async addExpense(expense: Omit<Expense, 'id'>) {
    const path = 'expenses';
    try {
      const batch = writeBatch(db);
      
      const sanitized = Object.fromEntries(Object.entries(expense).filter(([_, v]) => v !== undefined));
      const expenseRef = doc(collection(db, 'expenses'));
      batch.set(expenseRef, sanitized);

      // If it's an inventory expense, update product stock
      if (expense.isInventory && expense.productId && expense.quantity) {
        const productRef = doc(db, 'products', expense.productId);
        // Special case: if base unit is KG and user recorded in Grams
        let stockChange = expense.quantity;
        if (expense.unit === 'g') {
          stockChange = expense.quantity / 1000;
        }

        batch.update(productRef, {
          stock: increment(stockChange)
        });
      }

      await batch.commit();
      return expenseRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeExpenses(callback: (expenses: Expense[]) => void) {
    const path = 'expenses';
    const q = query(collection(db, path), orderBy('date', 'desc'));
    return onSnapshot(q,
      (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, path)
    );
  },

  async getExpenseCategories() {
    const path = 'expenseCategories';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // If empty, seed default categories
      if (categories.length === 0) {
        const defaults = [
          { name: 'Meat Purchase', type: 'inventory' },
          { name: 'Rent', type: 'operational' },
          { name: 'Electricity', type: 'operational' },
          { name: 'Transport', type: 'operational' },
          { name: 'Salaries', type: 'operational' },
          { name: 'Misc', type: 'other' }
        ];
        for (const cat of defaults) {
          await addDoc(collection(db, 'expenseCategories'), cat);
        }
        return this.getExpenseCategories();
      }
      
      return categories;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeExpenseCategories(callback: (categories: any[]) => void) {
    const path = 'expenseCategories';
    const q = query(collection(db, path), orderBy('name'));
    return onSnapshot(q,
      (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, path)
    );
  }
};
