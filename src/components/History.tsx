import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Sale } from '../types';
import { format } from 'date-fns';
import { dbService } from '../services/dbService';

const paymentIcons: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  upi: QrCode,
};

export default function SaleHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = dbService.subscribeSales(setSales);
    return () => unsubscribe();
  }, []);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-natural-text tracking-tight">Transaction History</h2>
          <p className="text-natural-text/60 mt-1">Review past orders and payment details ({sales.length} records)</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-natural-primary bg-natural-sidebar border border-natural-border rounded-xl hover:opacity-80 transition-all shadow-sm">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-natural-border shadow-sm overflow-hidden">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-sidebar/50 border-b border-natural-border text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">System ID</th>
                <th className="px-8 py-5">Status</th>
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
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-natural-primary font-black text-[9px] uppercase tracking-widest bg-[#E9EDC9] px-3 py-1 rounded-full w-fit">
                          Settled
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
                        <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-natural-border text-natural-text/40 hover:text-natural-primary transition-all shadow-sm opacity-0 group-hover:opacity-100">
                          <Eye size={16} />
                        </button>
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
