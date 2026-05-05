import * as XLSX from 'xlsx';
import { Sale, Product, Expense } from '../types';
import { format } from 'date-fns';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportFullReport = (sales: Sale[], products: Product[], expenses: Expense[]) => {
  const wb = XLSX.utils.book_new();

  // Sales Sheet
  const salesData = sales.map(sale => ({
    'Sale ID': sale.id,
    'Date': format(sale.date, 'yyyy-MM-dd HH:mm:ss'),
    'Total Amount': sale.total,
    'Payment Method': (sale.paymentMethod || 'N/A').toUpperCase(),
    'Items': (sale.items || []).map(item => `${item.name} (${item.quantity}${item.selectedUnit || item.unit})`).join(', ')
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Reports');

  // Inventory Sheet
  const inventoryData = products.map(product => ({
    'Name': product.name,
    'Category': (product.category || 'N/A').toUpperCase(),
    'Current Stock': product.stock,
    'Unit': product.unit,
    'Price per Unit': product.price,
    'Min Stock Alert': product.minStock || 0,
    'Status': product.stock <= (product.minStock || 5) ? 'LOW STOCK' : 'OK'
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Current Inventory');

  // Expenses Sheet
  const expensesData = expenses.map(expense => ({
    'Title': expense.title,
    'Date': format(expense.date, 'yyyy-MM-dd'),
    'Category': (expense.categoryName || 'N/A').toUpperCase(),
    'Amount': expense.amount,
    'Payment Method': (expense.paymentMethod || 'N/A').toUpperCase(),
    'Reference': expense.referenceNumber || 'N/A'
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

  // Summary Sheet
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const summaryData = [
    { 'Metric': 'Total Revenue', 'Value': totalSales },
    { 'Metric': 'Total Expenses', 'Value': totalExpenses },
    { 'Metric': 'Net Profit', 'Value': totalSales - totalExpenses },
    { 'Metric': 'Total Orders', 'Value': sales.length },
    { 'Metric': 'Products in Inventory', 'Value': products.length }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  XLSX.writeFile(wb, `MeatMaster_Business_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
