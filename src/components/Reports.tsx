import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  X,
  PieChart,
  BarChart3,
  ChevronDown,
  Printer
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Sale, Product, CartItem, Expense } from '../types';
import { format } from 'date-fns';
import { dbService } from '../services/dbService';
import ReceiptModal from './ReceiptModal';
import { exportFullReport } from '../lib/exportUtils';

const paymentIcons: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  upi: QrCode,
};

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Manual sale form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityUnit, setQuantityUnit] = useState<'kg' | 'g' | 'pc'>('kg');
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubSales = dbService.subscribeSales(setSales);
    const unsubProducts = dbService.subscribeProducts(setProducts);
    const unsubExpenses = dbService.subscribeExpenses(setExpenses);
    return () => {
      unsubSales();
      unsubProducts();
      unsubExpenses();
    };
  }, []);

  // Auto-calculate amount when product, quantity, or unit changes
  useEffect(() => {
    if (selectedProduct) {
      const basePrice = selectedProduct.price;
      let calcQuantity = quantity;
      
      if (quantityUnit === 'g') {
        calcQuantity = quantity / 1000;
      }
      
      setManualAmount(basePrice * calcQuantity);
    }
  }, [selectedProduct, quantity, quantityUnit]);

  // Set default unit when product changes
  useEffect(() => {
    if (selectedProduct) {
      setQuantityUnit(selectedProduct.unit === 'pcs' ? 'pc' : 'kg');
    }
  }, [selectedProduct]);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const displayQuantity = quantityUnit === 'g' ? `${quantity}g` : quantityUnit === 'pc' ? `${quantity} pc` : `${quantity}kg`;
      
      const cartItem: CartItem = {
        ...selectedProduct,
        quantity: quantityUnit === 'g' ? quantity / 1000 : quantity,
        // We add a custom property for display if needed, but the logic 
        // usually expects quantity as a multiplier for price
      };

      const newSale: Omit<Sale, 'id'> = {
        items: [cartItem],
        total: manualAmount, // Use the manually set or auto-calculated amount
        date: Date.now(),
        paymentMethod: paymentMethod
      };

      await dbService.addSale(newSale);
      setIsAddOpen(false);
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setQuantityUnit('kg');
      setManualAmount(0);
      setPaymentMethod('cash');
    } catch (error) {
      console.error("Failed to record manual sale", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate product summary
  interface SummaryItem {
    name: string;
    quantity: number;
    revenue: number;
  }

  const productSummary = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.id]) {
        acc[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      acc[item.id].quantity += item.quantity;
      acc[item.id].revenue += item.price * item.quantity;
    });
    return acc;
  }, {} as Record<string, SummaryItem>);

  const topProducts = (Object.values(productSummary) as SummaryItem[])
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-natural-text tracking-tight">Sales Report</h2>
          <p className="text-natural-text/60 mt-1">Manage sold products and revenue metrics ({sales.length} records)</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-natural-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-natural-primary/20 active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus size={18} />
            Add Sold Product
          </button>
          <button 
            onClick={() => exportFullReport(sales, products, expenses)}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-natural-primary bg-natural-sidebar border border-natural-border rounded-xl hover:opacity-80 transition-all shadow-sm"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </header>

      {/* Manual Sale Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-natural-text/20 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-natural-border shadow-2xl">
            <div className="p-8 bg-natural-sidebar border-b border-natural-border flex items-center justify-between">
              <h3 className="font-bold text-natural-text text-xl">Add Sold Product</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-natural-primary/40 hover:text-natural-primary">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleRecordSale} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Select Product</label>
                <select 
                  required
                  className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none"
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    setSelectedProduct(prod || null);
                  }}
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock} available)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Quantity</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="number" 
                      min="0.001"
                      step="any"
                      className="flex-1 min-w-0 border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                    />
                    <div className="relative">
                      <select 
                        className="w-24 h-full border-natural-border rounded-xl pl-4 pr-8 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none cursor-pointer"
                        value={quantityUnit}
                        onChange={e => setQuantityUnit(e.target.value as any)}
                      >
                        {selectedProduct?.unit === 'kg' ? (
                          <>
                            <option value="kg">KG</option>
                            <option value="g">gram</option>
                          </>
                        ) : (
                          <option value="pc">piece</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-natural-primary/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Amount (Rs.)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-black" 
                    value={manualAmount}
                    onChange={e => setManualAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Payment Method</label>
                  <select 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-natural-accent/20 rounded-xl border border-natural-border">
                  <div className="flex justify-between text-xs font-bold text-natural-primary/60 uppercase tracking-widest mb-1">
                    <span>Current Rate</span>
                    <span>Rs. {selectedProduct.price} / {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-natural-text">
                    <span>Summary Total</span>
                    <span>Rs. {manualAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !selectedProduct}
                className="w-full py-5 bg-natural-primary text-white rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-natural-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Recording..." : "Log Sale Entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-natural-border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-natural-sidebar rounded-xl text-natural-primary">
              <PieChart size={22} />
            </div>
            <h3 className="text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em]">Product Performance</h3>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm italic text-natural-text/40">No sales data yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-natural-primary/30">0{idx + 1}</span>
                    <p className="text-sm font-bold text-natural-text">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-natural-text">Rs. {p.revenue.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-natural-text/40 uppercase tracking-tight">{p.quantity} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#151619] p-8 rounded-xl shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-natural-accent text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-60">Revenue Breakdown</h3>
            <div className="flex flex-wrap gap-12">
              <div>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-2">Total Volume</p>
                <p className="text-white text-3xl font-black tracking-tight">Rs. {sales.reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
              </div>
              <div className="w-px h-12 bg-white/5 hidden sm:block" />
              <div>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-2">Items Moving</p>
                <p className="text-white text-xl font-black tracking-tight">{Object.keys(productSummary).length} Products Active</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-natural-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl border border-natural-border shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        <div className="p-6 border-b border-natural-border bg-natural-sidebar/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-primary/40" size={16} />
            <input 
              type="text" 
              placeholder="Search by Transaction ID..."
              className="pl-10 pr-4 py-2.5 text-sm bg-white border border-natural-border rounded-xl focus:ring-natural-primary focus:border-natural-primary w-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-sidebar/50 border-b border-natural-border text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">System ID</th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Method</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5 text-right">Settled Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-natural-text/40 font-bold uppercase tracking-widest text-xs">No transaction history found.</td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const Icon = paymentIcons[sale.paymentMethod] || Banknote;
                  return (
                    <tr key={sale.id} className="hover:bg-natural-sidebar/30 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-natural-text tracking-tight">{sale.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-8 py-5 text-xs">
                        <div className="flex flex-col gap-1">
                          {sale.items.map((item, id) => (
                            <span key={id} className="font-bold text-natural-text/60">
                              {item.name} <span className="text-[10px] text-natural-primary font-black uppercase ml-1">x {item.quantity} {item.unit}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-natural-text/70">
                          <Icon size={14} className="text-natural-primary/40" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{sale.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-natural-primary/40" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-natural-text">{format(sale.date, 'MMM dd, yyyy')}</span>
                            <span className="text-[10px] text-natural-text/40 font-bold uppercase tracking-tight">{format(sale.date, 'hh:mm a')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-natural-text tracking-tight">Rs. {sale.total.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowReceipt(true);
                            }}
                            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-natural-border text-natural-text/40 hover:text-natural-primary transition-all shadow-sm"
                            title="Print Receipt"
                          >
                            <Printer size={16} />
                          </button>
                          <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-natural-border text-natural-text/40 hover:text-natural-primary transition-all shadow-sm">
                            <Eye size={16} />
                          </button>
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
      
      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        sale={selectedSale} 
      />
    </div>
  );
}
