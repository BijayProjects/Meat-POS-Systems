import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  ArrowDownRight,
  TrendingUp,
  ShoppingBag,
  Home,
  Zap,
  Users,
  Truck,
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Expense } from '../types';
import { format } from 'date-fns';
import { dbService } from '../services/dbService';

const categoryIcons: Record<string, any> = {
  purchase: ShoppingBag,
  rent: Home,
  utility: Zap,
  salary: Users,
  transport: Truck,
  other: MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  purchase: 'bg-natural-sidebar text-natural-primary',
  rent: 'bg-natural-sidebar text-natural-primary',
  utility: 'bg-natural-sidebar text-natural-primary',
  salary: 'bg-natural-sidebar text-natural-primary',
  transport: 'bg-natural-sidebar text-natural-primary',
  other: 'bg-natural-sidebar text-natural-primary',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    title: '',
    amount: 0,
    category: 'purchase',
    date: Date.now(),
  });

  useEffect(() => {
    const unsubscribe = dbService.subscribeExpenses(setExpenses);
    return () => unsubscribe();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.addExpense(formData);
      setIsAddOpen(false);
      setFormData({
        title: '',
        amount: 0,
        category: 'purchase',
        date: Date.now(),
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add expense");
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-natural-text font-serif italic tracking-tight">Expense Ledger</h2>
          <p className="text-natural-text/60 mt-1">Track and categorize your shop expenditures</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-natural-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-natural-primary/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </header>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-natural-text/20 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-natural-border shadow-2xl">
            <div className="p-8 bg-natural-sidebar border-b border-natural-border flex items-center justify-between">
              <h3 className="font-bold text-natural-text text-xl">Record Expense</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-natural-primary/40 hover:text-natural-primary">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Expense Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Electricity Bill"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Category</label>
                  <select 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="purchase">Purchase (Inventory)</option>
                    <option value="rent">Rent</option>
                    <option value="utility">Utility (Electricity/Water)</option>
                    <option value="salary">Salary</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Amount (Rs.)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-black" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-natural-primary text-white rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-natural-primary/20 active:scale-95">
                Commit to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-xl border border-natural-border shadow-sm col-span-1 md:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-natural-sidebar rounded-xl text-natural-primary">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em]">Total Ledger</h3>
          </div>
          <p className="text-4xl font-black text-natural-text tracking-tight">Rs. {totalExpense.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#151619] p-8 rounded-xl shadow-xl col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-natural-accent text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-60">Spending Insights</h3>
            <div className="flex flex-wrap gap-12">
              <div>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-2">Fixed Monthly</p>
                <p className="text-white text-xl font-bold italic font-serif">Rent & Salaries</p>
              </div>
              <div className="w-px h-12 bg-white/5 hidden sm:block" />
              <div>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-2">Transaction Density</p>
                <p className="text-white text-xl font-black tracking-tight">{expenses.length} Records Activity</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-natural-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-natural-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-natural-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-natural-sidebar/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-primary/40" size={16} />
            <input 
              type="text" 
              placeholder="Search local records..."
              className="pl-10 pr-4 py-2.5 text-sm bg-white border border-natural-border rounded-xl focus:ring-natural-primary focus:border-natural-primary w-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-natural-primary/60 hover:text-natural-primary px-4 py-2.5 rounded-xl border border-natural-border bg-white transition-all shadow-sm">
            <Filter size={14} />
            Categorize
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-sidebar/50 border-b border-natural-border text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Class</th>
                <th className="px-8 py-5">Reference / Title</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-natural-text/40 font-bold uppercase tracking-widest text-xs italic">No entries in current ledger.</td>
                </tr>
              ) : (
                filteredExpenses.map(expense => {
                  const Icon = categoryIcons[expense.category] || MoreHorizontal;
                  return (
                    <tr key={expense.id} className="hover:bg-natural-sidebar/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="w-2.5 h-2.5 rounded-full bg-natural-primary shadow-[0_0_10px_rgba(96,108,56,0.2)]" />
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn("p-2.5 rounded-xl w-fit border border-natural-border", categoryColors[expense.category])}>
                          <Icon size={16} />
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-natural-text group-hover:text-natural-primary transition-colors leading-tight">{expense.title}</span>
                          <span className="text-[10px] text-natural-text/30 uppercase font-black tracking-[0.1em] mt-1">{expense.id.slice(0, 12)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-natural-text/60 font-bold uppercase tracking-wider">{format(expense.date, 'MMM dd, yyyy')}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-natural-text tracking-tight">Rs. {expense.amount.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
