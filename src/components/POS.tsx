import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  CreditCard, 
  Banknote, 
  QrCode,
  Tag,
  ShoppingCart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Product, CartItem, Category } from '../types';
import { dbService } from '../services/dbService';

const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'meat', label: 'Meat' },
  { id: 'egg', label: 'Eggs' },
  { id: 'veg', label: 'Vegetables' },
];

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = dbService.subscribeProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedUnit: product.unit }];
    });
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || total <= 0) return;
    setIsProcessing(true);
    try {
      await dbService.addSale({
        items: cart,
        total: total,
        date: Date.now(),
        paymentMethod
      });
      setCart([]);
      alert("Sale completed successfully!");
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateItemTotal = (item: CartItem) => {
    if (item.manualAmount !== undefined) return item.manualAmount;
    let effectivePrice = item.price;
    if (item.selectedUnit === 'g') {
      effectivePrice = item.price / 1000;
    }
    return effectivePrice * item.quantity;
  };

  const subtotal = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const tax = subtotal * 0.05; // 5% GST example
  const total = subtotal + tax;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-natural-text">Sales Terminal</h2>
            <p className="text-sm text-natural-text/60 font-medium">Select products for the current order</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-primary/40" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 bg-white border border-natural-border rounded-xl focus:ring-natural-primary focus:border-natural-primary w-full md:w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeCategory === cat.id 
                  ? "bg-natural-primary text-white shadow-sm" 
                  : "bg-natural-sidebar text-natural-primary/70 border border-natural-border hover:border-natural-primary/30"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "bg-white p-5 rounded-xl border border-natural-border shadow-sm hover:border-natural-primary hover:shadow-md transition-all text-left flex flex-col group relative",
                product.stock <= 0 && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-natural-sidebar rounded-lg group-hover:bg-natural-accent transition-colors">
                    <Tag size={16} className="text-natural-primary/40 group-hover:text-natural-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-natural-primary/50 uppercase tracking-widest">{product.category}</span>
                </div>
                <h3 className="font-bold text-natural-text mb-1 leading-tight">{product.name}</h3>
                <p className="text-[10px] text-natural-text/40 font-bold uppercase tracking-wider mb-6">{product.stock} {product.unit} available</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-black text-natural-text">Rs. {product.price}</span>
                  <div className="p-2 bg-natural-primary text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-sm shadow-natural-primary/20">
                    <Plus size={16} />
                  </div>
                </div>
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-2 right-2">
                   <div className="w-2 h-2 rounded-full bg-natural-tertiary animate-pulse" />
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-xl">
                  <span className="bg-natural-tertiary text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Out of Stock</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="w-full lg:w-[400px] bg-white rounded-xl border border-natural-border shadow-xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-natural-border flex items-center justify-between bg-white text-natural-text/90">
          <h3 className="font-bold flex items-center gap-2">
            Current Order
            <span className="bg-natural-sidebar text-natural-primary text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-widest">{cart.length} items</span>
          </h3>
          <button 
            onClick={() => setCart([])}
            className="text-[10px] font-black uppercase tracking-widest text-natural-tertiary hover:opacity-70 transition-all flex items-center gap-1.5"
          >
            <Trash2 size={12} />
            Empty
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <div className="w-16 h-16 bg-natural-sidebar rounded-full flex items-center justify-center text-natural-primary">
                <ShoppingCart size={24} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-natural-text/60">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-3 p-4 bg-natural-sidebar/30 rounded-xl border border-natural-border animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-natural-text leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-natural-text/40 uppercase tracking-widest">Base: Rs. {item.price} / {item.unit}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-natural-tertiary/40 hover:text-natural-tertiary transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-white rounded-lg border border-natural-border overflow-hidden focus-within:ring-1 focus-within:ring-natural-primary">
                    <input 
                      type="number" 
                      step="any"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateItem(item.id, { quantity: val, manualAmount: undefined });
                      }}
                      className="w-full px-3 py-1.5 text-xs font-bold text-natural-text focus:outline-none"
                    />
                    <select 
                      value={item.selectedUnit || item.unit}
                      onChange={(e) => {
                        const newUnit = e.target.value as any;
                        const oldUnit = item.selectedUnit || item.unit;
                        let newQty = item.quantity;
                        
                        // Auto-convert quantity when switching between KG and G
                        if (oldUnit === 'kg' && newUnit === 'g') newQty = item.quantity * 1000;
                        else if (oldUnit === 'g' && newUnit === 'kg') newQty = item.quantity / 1000;
                        
                        updateItem(item.id, { 
                          selectedUnit: newUnit, 
                          quantity: newQty,
                          manualAmount: undefined 
                        });
                      }}
                      className="bg-natural-sidebar px-2 py-1.5 text-[10px] font-black uppercase border-l border-natural-border focus:outline-none cursor-pointer"
                    >
                      {item.unit === 'kg' ? (
                        <>
                          <option value="kg">KG</option>
                          <option value="g">G</option>
                        </>
                      ) : (
                        <option value="pcs">PCS</option>
                      )}
                    </select>
                  </div>

                  <div className="w-24 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-natural-text/40">Rs.</span>
                    <input 
                      type="number"
                      value={item.manualAmount !== undefined ? item.manualAmount : calculateItemTotal(item).toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        let effectivePrice = item.price;
                        if (item.selectedUnit === 'g') {
                          effectivePrice = item.price / 1000;
                        }
                        const newQty = effectivePrice > 0 ? val / effectivePrice : 0;
                        updateItem(item.id, { 
                          manualAmount: val,
                          quantity: Number(newQty.toFixed(3))
                        });
                      }}
                      className={cn(
                        "w-full pl-7 pr-2 py-1.5 bg-white border rounded-lg text-xs font-black text-right focus:outline-none focus:ring-1 focus:ring-natural-primary",
                        item.manualAmount !== undefined ? "border-natural-tertiary text-natural-tertiary" : "border-natural-border text-natural-text"
                      )}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-[#F9F7F2] border-t border-natural-border space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-natural-text/50 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-natural-text/50 uppercase tracking-widest">
              <span>Tax (GST 5%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-natural-text pt-4 border-t border-natural-border/60">
              <span>Total</span>
              <span className="text-natural-primary">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                paymentMethod === 'cash' ? "bg-natural-primary border-natural-primary text-white shadow-md" : "bg-white border-natural-border text-natural-primary/60 hover:border-natural-primary/30"
              )}
            >
              <Banknote size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                paymentMethod === 'card' ? "bg-natural-primary border-natural-primary text-white shadow-md" : "bg-white border-natural-border text-natural-primary/60 hover:border-natural-primary/30"
              )}
            >
              <CreditCard size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">Card</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('upi')}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                paymentMethod === 'upi' ? "bg-natural-primary border-natural-primary text-white shadow-md" : "bg-white border-natural-border text-natural-primary/60 hover:border-natural-primary/30"
              )}
            >
              <QrCode size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">UPI</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing || total <= 0 || cart.some(item => calculateItemTotal(item) <= 0)}
            onClick={handleCheckout}
            className={cn(
              "w-full py-5 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
              (cart.length > 0 && total > 0 && cart.every(item => calculateItemTotal(item) > 0) && !isProcessing)
                ? "bg-natural-primary text-natural-accent shadow-natural-primary/20 hover:opacity-90" 
                : "bg-natural-border text-natural-text/30 cursor-not-allowed shadow-none"
            )}
          >
            {isProcessing ? "Processing..." : `Charge Rs. ${total.toLocaleString()}`}
            {!isProcessing && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
