import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const breadcrumb = location.pathname === '/admin/dashboard' ? '仪表盘'
    : location.pathname === '/admin/settings' ? '系统设置'
    : location.pathname === '/admin/users' ? '用户管理'
    : location.pathname === '/admin/logs' ? '操作日志'
    : '管理后台';

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 h-full w-60">
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="relative flex items-center gap-3 h-14 px-4 bg-slate-800/60 backdrop-blur-xl shrink-0 border-b border-slate-700/50">
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">管理后台</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{breadcrumb}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
              <Bell size={18} />
            </button>

            <button
              className="p-2 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
