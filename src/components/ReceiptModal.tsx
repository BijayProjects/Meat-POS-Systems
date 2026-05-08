import React, { useRef } from 'react';
import { X, Printer, Download, Receipt } from 'lucide-react';
import { Sale, CartItem } from '../types';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { cn } from '../lib/utils';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export default function ReceiptModal({ isOpen, onClose, sale }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;
    
    const element = receiptRef.current;
    const opt = {
      margin: 10,
      filename: `receipt-${sale.id.slice(-6)}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  const subtotal = sale.items.reduce((acc, item) => {
    let effectivePrice = item.price;
    if (item.selectedUnit === 'g') effectivePrice = item.price / 1000;
    return acc + (item.manualAmount !== undefined ? item.manualAmount : effectivePrice * item.quantity);
  }, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 bg-natural-text/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-natural-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-natural-sidebar rounded-xl text-natural-primary">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="font-bold text-natural-text">Order Receipt</h3>
              <p className="text-[10px] font-black text-natural-text/40 uppercase tracking-widest">Order ID: {sale.id.slice(-8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-natural-sidebar rounded-lg transition-colors">
            <X size={20} className="text-natural-text/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-natural-sidebar/10 custom-scrollbar">
          {/* Printable Area - Formatted for POS Receipt */}
          <div 
            ref={receiptRef}
            className="bg-white p-8 shadow-sm border border-natural-border rounded-sm mx-auto w-full max-w-[300px] font-mono text-xs receipt-content"
          >
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-sm font-black uppercase tracking-widest">EDEN FRESH MEAT SHOP</h1>
              <p className="text-[9px] text-natural-text/60">123 Market Street, Downtown<br/>Phone: +1 234 567 890</p>
              <div className="h-px bg-natural-text/10 my-2" />
              <p className="text-[9px] uppercase font-bold tracking-tighter">
                {format(sale.date, 'dd/MM/yyyy HH:mm:ss')}<br/>
                Bill #: {sale.id.slice(-8)}
              </p>
            </div>

            <table className="w-full mb-4 border-collapse">
              <thead>
                <tr className="border-b border-dashed border-natural-text/20">
                  <th className="text-left py-2 font-bold uppercase tracking-tighter">Item</th>
                  <th className="text-right py-2 font-bold uppercase tracking-tighter">Qty</th>
                  <th className="text-right py-2 font-bold uppercase tracking-tighter">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-natural-text/10">
                {sale.items.map((item, idx) => {
                  const itemPrice = item.manualAmount !== undefined 
                    ? item.manualAmount 
                    : (item.selectedUnit === 'g' ? item.price / 1000 : item.price) * item.quantity;
                  
                  return (
                    <tr key={idx}>
                      <td className="py-2 pr-2">
                        <span className="font-bold uppercase block leading-tight">{item.name}</span>
                        <span className="text-[8px] opacity-60">@{item.price}/{item.unit}</span>
                      </td>
                      <td className="py-2 text-right">
                        {item.quantity.toFixed(2)}{item.selectedUnit || item.unit}
                      </td>
                      <td className="py-2 text-right">
                        {itemPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="space-y-1 border-t border-dashed border-natural-text/20 pt-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 5%)</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-double border-natural-text/20">
                <span>TOTAL</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center flex-col items-center gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest border px-2 py-1 border-natural-text/20 rounded">
                  PAID VIA {sale.paymentMethod}
                </span>
              </div>
              <p className="text-[9px] italic opacity-60">Thank you for shopping with us!</p>
              <p className="text-[7px] opacity-40">Software powered by Eden Fresh Meat Shop</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-natural-border grid grid-cols-2 gap-4">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 py-3 border border-natural-border rounded-xl text-xs font-bold text-natural-text hover:bg-natural-sidebar transition-all"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 bg-natural-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-natural-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
