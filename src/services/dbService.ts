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
      return await addDoc(collection(db, path), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Sales
  async addSale(sale: Omit<Sale, 'id'>) {
    const path = 'sales';
    try {
      const batch = writeBatch(db);
      
      // 1. Create Sale Document
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, sale);

      // 2. Update Product Stock
      sale.items.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: increment(-item.quantity)
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
      return await addDoc(collection(db, path), expense);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
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
  }
};
