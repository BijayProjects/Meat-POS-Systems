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
  LogOut,
  Download,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { logout } from '../lib/firebase';
import { usePWA } from '../hooks/usePWA';

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
  const [showHelp, setShowHelp] = React.useState(false);
  const { isInstallable, installApp } = usePWA();

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

          <nav className="space-y-1 flex-1">
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
            {isInstallable && (
              <button 
                onClick={installApp}
                className="flex items-center gap-3 px-4 py-3 text-natural-primary hover:bg-natural-primary/10 text-sm font-bold transition-colors w-full rounded-xl"
              >
                <Download size={18} />
                Download App
              </button>
            )}
            <button 
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-3 px-4 py-3 text-natural-text/60 hover:text-natural-text text-sm font-medium transition-colors w-full rounded-xl hover:bg-white/50"
            >
              <HelpCircle size={18} />
              Help & Deploy
            </button>
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="text-natural-primary" />
              Deployment & Installation
            </h2>
            
            <div className="space-y-6 text-sm text-natural-text/80">
              <section>
                <h3 className="font-bold text-natural-text mb-2 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                  🚀 Deploy to Vercel
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>In the top right menu of AI Studio, go to **Settings**.</li>
                  <li>Click **Export to GitHub** or **Export to ZIP**.</li>
                  <li>Go to [vercel.com](https://vercel.com) and import your project.</li>
                  <li>Add your Firebase environment variables in Vercel.</li>
                </ol>
              </section>

              <section>
                <h3 className="font-bold text-natural-text mb-2 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                  📱 Install on Devices (Mac/Phone)
                </h3>
                <p>This is a Progressive Web App (PWA). You can "install" it to your home screen or applications folder:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>**Mac/Desktop**: Click the "Download App" button in the sidebar or the icon in your browser's address bar.</li>
                  <li>**iPhone**: Tap the Share button in Safari and select "Add to Home Screen".</li>
                  <li>**Android**: Tap the menu button in Chrome and select "Install app".</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-natural-text mb-2 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                  🗄️ Database Access
                </h3>
                <p>You can access your real-time database here:</p>
                <a 
                  href="https://console.firebase.google.com/project/gemini-api-470919/firestore/databases/ai-studio-42879566-8389-424b-bd28-a093e362c9c9/data" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-natural-primary font-bold hover:underline"
                >
                  Firebase Console <ExternalLink size={14} />
                </a>
              </section>
            </div>
            
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-8 py-3 bg-natural-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
