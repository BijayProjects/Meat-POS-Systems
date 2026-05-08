import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  ArrowUpDown, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Product, Category } from '../types';
import { dbService } from '../services/dbService';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'meat',
    price: 0,
    unit: 'kg',
    stock: 0,
    minStock: 2,
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        unit: editingProduct.unit,
        stock: editingProduct.stock,
        minStock: editingProduct.minStock || 2,
      });
    } else {
      setFormData({
        name: '',
        category: 'meat',
        price: 0,
        unit: 'kg',
        stock: 0,
        minStock: 2,
      });
    }
  }, [editingProduct]);

  useEffect(() => {
    const unsubscribe = dbService.subscribeProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await dbService.updateProduct(editingProduct.id, formData);
      } else {
        await dbService.addProduct(formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      alert(`Failed to ${editingProduct ? 'update' : 'add'} product`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await dbService.deleteProduct(id);
      } catch (error) {
        console.error(error);
        alert("Failed to delete product");
      }
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-natural-text tracking-tight">Inventory Control</h2>
          <p className="text-natural-text/60 mt-1">Manage your product list and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-primary/40" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2.5 bg-white border border-natural-border rounded-xl focus:ring-natural-primary focus:border-natural-primary w-full md:w-64 text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddClick}
            className="bg-natural-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-natural-primary/20 active:scale-95 text-sm uppercase tracking-widest"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </header>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-natural-text/20 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-natural-border shadow-2xl">
            <div className="p-8 bg-natural-sidebar border-b border-natural-border flex items-center justify-between">
              <h3 className="font-bold text-natural-text text-xl">{editingProduct ? 'Edit Product' : 'New Product Entry'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-natural-primary/40 hover:text-natural-primary">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Product Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Premium Ribeye"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Category</label>
                  <select 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                  >
                    <option value="meat">Meat</option>
                    <option value="egg">Eggs</option>
                    <option value="veg">Vegetables</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Unit</label>
                  <select 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold appearance-none"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value as any})}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Piece (pcs)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Price (Rs.)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">{editingProduct ? 'Current Stock' : 'Initial Stock'}</label>
                  <input 
                    required
                    type="number" 
                    className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-natural-primary/40 uppercase tracking-[0.2em] mb-2">Restock Alert Threshold</label>
                <input 
                  required
                  type="number" 
                  className="w-full border-natural-border rounded-xl p-4 focus:ring-natural-primary focus:border-natural-primary bg-natural-sidebar/30 text-natural-text font-bold" 
                  value={formData.minStock}
                  onChange={e => setFormData({...formData, minStock: Number(e.target.value)})}
                />
              </div>
              <button type="submit" className="w-full py-5 bg-natural-primary text-white rounded-xl font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-natural-primary/20 active:scale-95">
                {editingProduct ? 'Update Product' : 'Commit to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-natural-border shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-natural-sidebar/50 border-b border-natural-border">
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">Current Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">Unit Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em]">Availability</th>
                <th className="px-8 py-5 text-[10px] font-black text-natural-primary/50 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-natural-text/40 font-bold uppercase tracking-widest text-xs">The inventory is currently empty.</td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLow = product.minStock ? product.stock <= product.minStock : false;
                  return (
                    <tr key={product.id} className="hover:bg-natural-sidebar/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-2.5 rounded-xl border",
                            product.category === 'meat' ? "bg-red-50 text-red-600 border-red-100" :
                            product.category === 'egg' ? "bg-natural-accent text-natural-tertiary border-natural-border" :
                            "bg-green-50 text-green-600 border-green-100"
                          )}>
                            <Box size={18} />
                          </div>
                          <span className="font-bold text-natural-text">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold text-natural-primary/60 uppercase tracking-widest bg-natural-sidebar px-2 py-1 rounded-lg">{product.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-natural-text">{product.stock.toFixed(2)} {product.unit}</span>
                          <span className="text-[10px] font-bold text-natural-text/30 uppercase tracking-wider">Refill: {product.minStock?.toFixed(2)} {product.unit}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-natural-text">Rs. {product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6">
                        {isLow ? (
                          <div className="flex items-center gap-2 text-natural-tertiary bg-natural-accent px-3 py-1 rounded-full w-fit border border-natural-border">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Low Stock</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-natural-primary bg-[#E9EDC9] px-3 py-1 rounded-full w-fit border border-[#606C38]/10">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Secure</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-natural-border text-natural-text/40 hover:text-natural-primary transition-all shadow-sm flex items-center justify-center"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-red-100 text-natural-text/40 hover:text-red-600 transition-all shadow-sm flex items-center justify-center"
                          >
                            <Trash2 size={18} />
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
      
      <div className="p-6 bg-natural-sidebar/30 border-t border-natural-border flex items-center justify-between text-[10px] font-black text-natural-text/40 uppercase tracking-widest">
        <p>Showing {filteredProducts.length} items in registry</p>
        <div className="flex items-center gap-6">
          <button className="hover:text-natural-primary transition-colors">Previous</button>
          <button className="hover:text-natural-primary transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
