import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Home, 
  Film, 
  Tv,
  Radio,
  User, 
  LogOut, 
  Menu, 
  X,
  Download
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, accountInfo, downloads } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusedNavIndex, setFocusedNavIndex] = useState(0);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const message = `Runtime error: ${e.message}`;
      const el = document.getElementById('error-log');
      if (el) el.textContent = message;
      // eslint-disable-next-line no-console
      console.log(message);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const message = `Unhandled rejection: ${String(e.reason)}`;
      const el = document.getElementById('error-log');
      if (el) el.textContent = message;
      // eslint-disable-next-line no-console
      console.log(message);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection as any);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection as any);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Movies', href: '/movies', icon: Film },
    { name: 'TV Series', href: '/series', icon: Tv },
    { name: 'Live', href: '/live', icon: Radio }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  // Remote navigation for sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sidebarRef.current) return;
      const focusable = Array.from(sidebarRef.current.querySelectorAll('[data-nav-item]')) as HTMLElement[];
      if (focusable.length === 0) return;

      const currentIndex = focusable.findIndex(el => el === document.activeElement);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          nextIndex = Math.min(focusable.length - 1, (currentIndex === -1 ? 0 : currentIndex + 1));
          break;
        case 'ArrowUp':
          nextIndex = Math.max(0, (currentIndex === -1 ? 0 : currentIndex - 1));
          break;
        case 'Enter':
          if (currentIndex >= 0) {
            e.preventDefault();
            focusable[currentIndex].click();
          }
          return;
        case 'Menu':
          e.preventDefault();
          setSidebarOpen(!sidebarOpen);
          return;
        default:
          return;
      }
      e.preventDefault();
      focusable[nextIndex]?.focus();
      setFocusedNavIndex(nextIndex);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Focus first nav item when sidebar opens
  useEffect(() => {
    if (sidebarOpen && sidebarRef.current) {
      const firstItem = sidebarRef.current.querySelector('[data-nav-item]') as HTMLElement;
      firstItem?.focus();
      setFocusedNavIndex(0);
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-dark-900">
      <div id="error-log" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, color: '#f87171', background: 'rgba(0,0,0,0.6)', fontSize: 12, padding: 4, zIndex: 9999 }} />
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-dark-800 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <h2 className="text-xl font-bold text-white">IPTV Player</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-dark-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav ref={sidebarRef} className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                  data-nav-item
                  tabIndex={0}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-dark-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-xl font-bold text-white">IPTV Player</h2>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                  }`}
                  data-nav-item
                  tabIndex={0}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-dark-800 border-b border-dark-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-dark-400 hover:text-white mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-semibold text-white">
                {navigation.find(item => isActive(item.href))?.name || 'IPTV Player'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Downloads indicator */}
              {downloads.length > 0 && (
                <div className="relative">
                  <button className="p-2 text-dark-400 hover:text-white">
                    <Download className="w-5 h-5" />
                  </button>
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {downloads.length}
                  </span>
                </div>
              )}

              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {accountInfo?.user_info?.username || 'User'}
                  </p>
                  <p className="text-xs text-dark-400">
                    {accountInfo?.user_info?.status || 'Active'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-dark-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-col sm:flex-row justify-between items-center py-4">
              {/* ...existing code... */}
            </nav>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
