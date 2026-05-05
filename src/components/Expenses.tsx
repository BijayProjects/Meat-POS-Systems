import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  ShoppingBag,
  Home,
  Zap,
  Users,
  Truck,
  MoreHorizontal,
  X,
  Calendar,
  Building2,
  FileText,
  CreditCard,
  Hash,
  Box,
  Scale,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Expense, ExpenseCategory, Product } from '../types';
import { format } from 'date-fns';
import { dbService } from '../services/dbService';

const categoryIcons: Record<string, any> = {
  inventory: ShoppingBag,
  operational: Home,
  other: MoreHorizontal,
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Expense, 'id' | 'createdAt'>>({
    title: '',
    amount: 0,
    date: Date.now(),
    categoryId: '',
    categoryName: '',
    vendorName: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    description: '',
    isInventory: false,
    productId: '',
    quantity: 0,
    unit: 'kg',
    unitPrice: 0,
  });

  useEffect(() => {
    const unsubExpenses = dbService.subscribeExpenses(setExpenses);
    const unsubCategories = dbService.subscribeExpenseCategories(setCategories);
    const unsubProducts = dbService.subscribeProducts(setProducts);

    // Initial seed check
    dbService.getExpenseCategories().then(setCategories);

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubProducts();
    };
  }, []);

  const handleCategoryChange = (catId: string) => {
    const category = categories.find(c => c.id === catId);
    if (category) {
      setFormData({
        ...formData,
        categoryId: catId,
        categoryName: category.name,
        isInventory: category.type === 'inventory',
        title: category.type === 'inventory' ? `${category.name}` : formData.title
      });
    }
  };

  const handleProductChange = (prodId: string) => {
    const product = products.find(p => p.id === prodId);
    if (product) {
      setFormData({
        ...formData,
        productId: prodId,
        unit: product.unit,
        unitPrice: product.price,
        title: `${formData.categoryName} - ${product.name}`
      });
    }
  };

  const handleAmountChange = (val: number) => {
    if (formData.isInventory && formData.unitPrice && formData.unitPrice > 0) {
      const newQty = val / (formData.unitPrice || 1);
      setFormData({
        ...formData,
        amount: val,
        quantity: Number(newQty.toFixed(3))
      });
    } else {
      setFormData({ ...formData, amount: val });
    }
  };

  const handleQuantityChange = (qty: number) => {
    if (formData.isInventory && formData.unitPrice) {
      setFormData({
        ...formData,
        quantity: qty,
        amount: Number((qty * formData.unitPrice).toFixed(2))
      });
    } else {
      setFormData({ ...formData, quantity: qty });
    }
  };

  const handleUnitPriceChange = (rate: number) => {
    if (formData.isInventory && formData.quantity) {
      setFormData({
        ...formData,
        unitPrice: rate,
        amount: Number((formData.quantity * rate).toFixed(2))
      });
    } else {
      setFormData({ ...formData, unitPrice: rate });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.addExpense({
        ...formData,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to add expense");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: 0,
      date: Date.now(),
      categoryId: '',
      categoryName: '',
      vendorName: '',
      paymentMethod: 'cash',
      referenceNumber: '',
      description: '',
      isInventory: false,
      productId: '',
      quantity: 0,
      unit: 'kg',
      unitPrice: 0,
    });
  };

  const filteredExpenses = expenses.filter(e => 
    (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-natural-text tracking-tight uppercase">Expense Hub</h2>
          <p className="text-natural-text/60 mt-1 font-medium italic">Comprehensive billing and expenditure tracking</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-natural-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-95 transition-all shadow-xl shadow-natural-primary/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={20} />
          Record New Bill
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-natural-border shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-natural-sidebar rounded-xl text-natural-primary">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em]">Total Outflow</h3>
          </div>
          <p className="text-4xl font-black text-natural-text">Rs. {totalExpense.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-natural-border shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-natural-sidebar rounded-xl text-natural-primary">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em]">Inventory Cost</h3>
          </div>
          <p className="text-4xl font-black text-natural-text">
            Rs. {expenses.filter(e => e.isInventory).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-natural-border shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-natural-sidebar rounded-xl text-natural-primary">
              <Zap size={24} />
            </div>
            <h3 className="text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em]">Operational</h3>
          </div>
          <p className="text-4xl font-black text-natural-text">
            Rs. {expenses.filter(e => !e.isInventory).reduce((acc, e) => acc + e.amount, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#151619] p-8 rounded-2xl shadow-2xl flex flex-col justify-center">
          <p className="text-natural-accent/40 text-[10px] uppercase font-black tracking-widest mb-2">Record Count</p>
          <p className="text-white text-3xl font-black">{expenses.length} Bills</p>
        </div>
      </div>

      {/* Table & List */}
      <div className="bg-white rounded-2xl border border-natural-border shadow-md overflow-hidden">
        <div className="p-6 border-b border-natural-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-natural-sidebar/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/30" size={18} />
            <input 
              type="text" 
              placeholder="Search bills, vendors, or categories..."
              className="pl-12 pr-4 py-3 text-sm bg-white border border-natural-border rounded-xl focus:ring-1 focus:ring-natural-primary focus:outline-none w-full shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-natural-primary/60 hover:text-natural-primary px-5 py-3 rounded-xl border border-natural-border bg-white transition-all shadow-sm">
              <Calendar size={14} />
              This Month
            </button>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-natural-primary/60 hover:text-natural-primary px-5 py-3 rounded-xl border border-natural-border bg-white transition-all shadow-sm font-black">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[600px] flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-sidebar/40 border-b border-natural-border text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Bill Context</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Vendor / Entity</th>
                <th className="px-8 py-6 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <FileText size={48} />
                      <p className="font-bold uppercase tracking-widest text-xs italic">No expense history detected.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  const Icon = categoryIcons[category?.type || 'other'] || MoreHorizontal;
                  return (
                    <tr key={expense.id} className="hover:bg-natural-sidebar/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-xl border border-natural-border",
                            expense.isInventory ? "bg-natural-sidebar text-natural-primary" : "bg-white text-natural-text/60"
                          )}>
                            <Icon size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-natural-text group-hover:text-natural-primary transition-colors leading-tight uppercase tracking-tight">{expense.title}</span>
                            <span className="text-[10px] text-natural-text/40 font-bold uppercase tracking-widest mt-1">
                              {format(expense.date, 'MMM dd, yyyy')} • {expense.paymentMethod}
                              {expense.referenceNumber && ` • Bill #${expense.referenceNumber}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-natural-sidebar/50 rounded-full text-[10px] font-black text-natural-primary uppercase tracking-widest border border-natural-border/50">
                          {expense.categoryName}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-natural-text/60">{expense.vendorName || '--'}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-natural-text tracking-tight">Rs. {expense.amount.toLocaleString()}</span>
                          {expense.isInventory && (
                            <span className="text-[10px] text-natural-primary font-black uppercase tracking-widest opacity-60">
                              {expense.quantity} {expense.unit} Recieved
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-[#000000a0] backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-natural-border shadow-[0_0_50px_rgba(0,0,0,0.1)]">
            <div className="p-8 bg-natural-sidebar border-b border-natural-border flex items-center justify-between">
              <div>
                <h3 className="font-black text-natural-text text-xl uppercase tracking-tight">New Bill Entry</h3>
                <p className="text-natural-text/40 text-[10px] font-black uppercase tracking-widest mt-1">Universal Expense Portal</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-natural-primary/40 hover:text-natural-primary transition-colors bg-white p-2 rounded-full shadow-sm">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Category Searchable Selection */}
              <div className="space-y-4 relative">
                <label className="flex items-center gap-2 text-[10px] font-black text-natural-primary uppercase tracking-[0.2em]">
                  <Filter size={12} />
                  1. Select Category
                </label>
                <div className="relative group/search">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/20 pointer-events-none">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search or Select Category..."
                    className="w-full border-natural-border rounded-xl pl-12 pr-12 py-4 bg-natural-sidebar/10 text-natural-text font-bold text-sm focus:outline-none focus:ring-1 focus:ring-natural-primary cursor-pointer"
                    value={formData.categoryName || ''}
                    readOnly={!!formData.categoryId}
                    onClick={(e) => {
                      const container = e.currentTarget.nextElementSibling?.nextElementSibling;
                      if (container) container.classList.toggle('hidden');
                    }}
                    onChange={(e) => {
                      if (!formData.categoryId) {
                        setFormData({ ...formData, categoryName: e.target.value });
                      }
                    }}
                  />
                  {formData.categoryId ? (
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, categoryId: '', categoryName: '', isInventory: false})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-natural-primary hover:scale-110 transition-transform"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-natural-text/20 pointer-events-none">
                      <ChevronDown size={18} />
                    </div>
                  )}

                  {/* Dropdown Results */}
                  <div className="hidden absolute z-[110] left-0 right-0 top-full mt-2 bg-white border border-natural-border rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-natural-border bg-natural-sidebar/20">
                      <input 
                        type="text"
                        placeholder="Type to filter..."
                        className="w-full p-2 text-xs border-none bg-transparent focus:outline-none font-bold"
                        autoFocus
                        onChange={(e) => {
                           const items = e.currentTarget.parentElement?.nextElementSibling?.children;
                           if (items) {
                             Array.from(items).forEach((item: any) => {
                               const text = item.innerText.toLowerCase();
                               item.style.display = text.includes(e.target.value.toLowerCase()) ? 'flex' : 'none';
                             });
                           }
                        }}
                      />
                    </div>
                    <div className="py-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          className="w-full px-6 py-4 text-left hover:bg-natural-sidebar/40 flex items-center justify-between border-b border-natural-border last:border-none group"
                          onClick={(e) => {
                            handleCategoryChange(cat.id);
                            e.currentTarget.parentElement?.parentElement?.classList.add('hidden');
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-natural-text uppercase group-hover:text-natural-primary transition-colors">{cat.name}</span>
                            <span className="text-[10px] font-black text-natural-text/40 tracking-widest uppercase">{cat.type}</span>
                          </div>
                          {formData.categoryId === cat.id && (
                            <div className="w-2 h-2 rounded-full bg-natural-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-natural-primary uppercase tracking-[0.2em]">
                    <FileText size={12} />
                    Entry Details
                  </label>
                  <input 
                    required
                    type="text" 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-1 focus:ring-natural-primary bg-natural-sidebar/10 text-natural-text font-bold text-sm focus:outline-none" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Bill Title"
                  />
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/20" size={16} />
                    <input 
                      type="text" 
                      className="w-full border-natural-border rounded-xl pl-12 pr-4 py-4 focus:ring-1 focus:ring-natural-primary bg-natural-sidebar/10 text-natural-text font-bold text-sm focus:outline-none" 
                      value={formData.vendorName}
                      onChange={e => setFormData({...formData, vendorName: e.target.value})}
                      placeholder="Vendor / Paid To"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/20" size={16} />
                    <input 
                      required
                      type="date" 
                      className="w-full border-natural-border rounded-xl pl-12 pr-4 py-4 focus:ring-1 focus:ring-natural-primary bg-natural-sidebar/10 text-natural-text font-bold text-sm focus:outline-none" 
                      value={format(formData.date, 'yyyy-MM-dd')}
                      onChange={e => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) {
                          setFormData({...formData, date: newDate.getTime()});
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-black text-natural-primary uppercase tracking-[0.2em]">
                    <CreditCard size={12} />
                    Payment Context
                  </label>
                  <select 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-1 focus:ring-natural-primary bg-natural-sidebar/10 text-natural-text font-bold text-sm focus:outline-none"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                  >
                    <option value="cash">Cash Payment</option>
                    <option value="card">Card / POS</option>
                    <option value="upi">UPI / Digital Scan</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="digital">Other Digital</option>
                  </select>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/20" size={16} />
                    <input 
                      type="text" 
                      className="w-full border-natural-border rounded-xl pl-12 pr-4 py-4 focus:ring-1 focus:ring-natural-primary bg-natural-sidebar/10 text-natural-text font-medium text-sm focus:outline-none" 
                      value={formData.referenceNumber}
                      onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
                      placeholder="Bill / Invoice Number"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Specific Fields */}
              {formData.isInventory && (
                <div className="bg-natural-sidebar/30 p-6 rounded-2xl border border-natural-primary/10 space-y-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-natural-primary uppercase tracking-[0.2em]">
                      <Box size={14} />
                      Inventory Link (Automated Stock In)
                    </h4>
                    <span className="text-[10px] font-black text-natural-primary/40 italic">Stock will be added upon save</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                      required
                      className="w-full border-natural-border rounded-xl p-4 bg-white text-natural-text font-bold text-sm focus:outline-none focus:ring-1 focus:ring-natural-primary shadow-sm"
                      value={formData.productId}
                      onChange={e => handleProductChange(e.target.value)}
                    >
                      <option value="">Select Linked Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                       <input 
                        required
                        type="number" 
                        step="any"
                        placeholder="Qty"
                        className="w-full border-natural-border rounded-xl p-4 bg-white text-natural-text font-black text-sm focus:outline-none focus:ring-1 focus:ring-natural-primary shadow-sm" 
                        value={formData.quantity || ''}
                        onChange={e => handleQuantityChange(Number(e.target.value))}
                      />
                      <select 
                        className="w-24 border-natural-border rounded-xl p-4 bg-white text-natural-text font-bold text-xs focus:outline-none focus:ring-1 focus:ring-natural-primary shadow-sm"
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      >
                        <option value="kg">KG</option>
                        <option value="g">G</option>
                        <option value="pcs">PCS</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-text/30 font-black text-xs">Rate Rs.</span>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full border-natural-border rounded-xl pl-20 pr-4 py-4 bg-white text-natural-text font-bold text-sm focus:outline-none focus:ring-1 focus:ring-natural-primary shadow-sm" 
                      value={formData.unitPrice || ''}
                      onChange={e => handleUnitPriceChange(Number(e.target.value))}
                      placeholder="Price per unit"
                    />
                  </div>
                </div>
              )}

              {/* Total Amount (Automated for inventory, manual for others) */}
              <div className="bg-natural-primary/5 p-8 rounded-3xl border border-natural-primary/20">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-natural-primary uppercase tracking-[0.2em]">Final Transaction Amount</label>
                   {formData.isInventory && (
                     <span className="text-[10px] font-bold text-natural-primary/40 italic">Linked with quantity/rate</span>
                   )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-primary font-black text-xl">Rs.</span>
                  <input 
                    required
                    type="number" 
                    step="any"
                    className={cn(
                      "w-full pl-14 pr-6 py-6 rounded-2xl text-4xl font-black focus:outline-none transition-all bg-white border-2 border-natural-primary/20 text-natural-text focus:border-natural-primary shadow-inner",
                      formData.isInventory && "text-natural-primary"
                    )} 
                    value={formData.amount || ''}
                    onChange={e => handleAmountChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-5 border-2 border-natural-border text-natural-text/60 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-natural-sidebar transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-5 bg-natural-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:opacity-95 transition-all shadow-2xl shadow-natural-primary/30 active:scale-[0.98]"
                >
                  Authorize Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
