import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Box, 
  ReceiptIndianRupee, 
  History, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { logout } from '../lib/firebase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Items', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Box },
  { id: 'expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { id: 'reports', label: 'Sales Report', icon: History },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-gray-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-natural-sidebar text-natural-text w-64 transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 border-r border-natural-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-natural-primary rounded-lg flex items-center justify-center text-white">
              <Box size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Eden Fresh</h1>
          </div>
          <p className="text-[10px] text-natural-primary/60 uppercase tracking-widest font-bold mb-8">Meat Shop</p>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                  activeTab === item.id 
                    ? "bg-white text-natural-primary shadow-sm border border-natural-border" 
                    : "text-natural-text/70 hover:bg-natural-border/30"
                )}
              >
                <item.icon size={18} className={cn(
                  activeTab === item.id ? "text-natural-primary" : "text-natural-primary/50"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="space-y-1 pt-4 border-t border-natural-border">
            <button className="flex items-center gap-3 px-4 py-3 text-natural-text/60 hover:text-natural-text text-sm font-medium transition-colors w-full rounded-xl hover:bg-white/50">
              <Settings size={18} />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-600/80 hover:text-red-600 text-sm font-medium transition-colors w-full rounded-xl hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
