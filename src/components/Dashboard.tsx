import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  ReceiptIndianRupee,
  Box
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Product, Sale, Expense } from '../types';
import { startOfDay, subDays, isWithinInterval, format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendColor?: string;
  icon: React.ElementType;
  description: string;
}

function StatCard({ title, value, trend, trendColor, icon: Icon, description }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-natural-border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-natural-sidebar rounded-xl text-natural-primary">
          <Icon size={20} />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full", trendColor)}>
            {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-bold text-natural-text/50 uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-bold tracking-tight text-natural-text">{value}</p>
        <p className="text-[10px] text-natural-text/40 font-medium uppercase tracking-wider mt-2">{description}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const unsubProducts = dbService.subscribeProducts(setProducts);
    const unsubSales = dbService.subscribeSales(setSales);
    const unsubExpenses = dbService.subscribeExpenses(setExpenses);
    return () => {
      unsubProducts();
      unsubSales();
      unsubExpenses();
    };
  }, []);

  // Calculate Stats
  const today = startOfDay(new Date()).getTime();
  const todaySales = sales.filter(s => s.date >= today);
  const todayExpenses = expenses.filter(e => e.date >= today);
  
  const dailyRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
  const dailyExp = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const dailyProfit = dailyRevenue - dailyExp;
  const lowStockCount = products.filter(p => p.minStock ? p.stock <= p.minStock : p.stock <= 5).length;

  // Chart Data (Last 7 Days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const start = startOfDay(d).getTime();
    const end = start + 86400000;
    
    const daySales = sales.filter(s => s.date >= start && s.date < end);
    const dayExp = expenses.filter(e => e.date >= start && e.date < end);
    
    return {
      name: format(d, 'EEE'),
      sales: daySales.reduce((acc, s) => acc + s.total, 0),
      expenses: dayExp.reduce((acc, e) => acc + e.amount, 0),
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-natural-text font-serif italic mb-2">Overview</h2>
        <p className="text-natural-text/60">Welcome back. Performance metrics for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Sales" 
          value={`Rs. ${dailyRevenue.toLocaleString()}`} 
          icon={TrendingUp}
          description={`Revenue from ${todaySales.length} orders`}
        />
        <StatCard 
          title="Today's Expenses" 
          value={`Rs. ${dailyExp.toLocaleString()}`} 
          icon={TrendingDown}
          description="Inventory and shop costs"
        />
        <StatCard 
          title="Potential Profit" 
          value={`Rs. ${dailyProfit.toLocaleString()}`} 
          trendColor={dailyProfit >= 0 ? "bg-[#E9EDC9] text-[#606C38]" : "bg-red-50 text-red-700"}
          icon={Wallet}
          description="Net daily earnings"
        />
        <StatCard 
          title="Low Stock" 
          value={`${lowStockCount} items`} 
          icon={AlertTriangle}
          trendColor={lowStockCount > 0 ? "bg-[#FEFAE0] text-[#BC6C25]" : "bg-natural-sidebar text-natural-text/40"}
          description="Action required for refill"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-natural-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-natural-text">Weekly Performance</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#606C38" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#606C38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#606C38', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#606C38', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #E5E2D9', boxShadow: 'none', backgroundColor: '#FAF9F6' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#606C38" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" stroke="#DDA15E" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-natural-border shadow-sm flex flex-col">
          <h3 className="font-semibold text-natural-text mb-6">Stock Alerts</h3>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-none">
            {products.filter(p => (p.minStock ? p.stock <= p.minStock : p.stock <= 5)).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-natural-accent/50 border border-natural-border">
                <div>
                  <p className="text-sm font-bold text-natural-text">{p.name}</p>
                  <p className="text-xs text-natural-tertiary font-bold uppercase tracking-wider">{p.stock} {p.unit} left</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-natural-border text-natural-tertiary shadow-sm">
                  <AlertTriangle size={14} />
                </div>
              </div>
            ))}
            {products.filter(p => (p.minStock ? p.stock <= p.minStock : p.stock <= 5)).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
                <Box size={32} className="text-natural-primary/40 mb-2" />
                <p className="text-sm font-medium">All stocks are healthy</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-natural-border flex items-center justify-between text-[10px] font-black text-natural-text/40 tracking-widest uppercase">
            <span>Inventory Status</span>
            <span className="text-natural-primary text-xs tracking-normal">{products.length} Products</span>
          </div>
        </div>
      </div>
    </div>
  );
}
