import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/admin/dashboard', label: '仪表盘', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/users', label: '用户管理', icon: <Users size={18} /> },
    { path: '/admin/redeem-codes', label: '兑换码管理', icon: <Ticket size={18} /> },
    { path: '/admin/settings', label: '系统设置', icon: <Settings size={18} /> },
    { path: '/admin/logs', label: '操作日志', icon: <FileText size={18} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="flex flex-col h-screen bg-slate-800/60 backdrop-blur-2xl border-r border-slate-700/50 w-60 shrink-0">
      <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-700/50">
        <Shield size={24} className="text-vault-accent shrink-0" />
        <span className="font-display font-bold text-lg text-white tracking-tight">
          VaultKey
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive(item.path)
                  ? 'bg-vault-accent/10 text-vault-accent'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-2">
        <div className="flex items-center justify-center py-2">
          <span className="text-xs text-slate-600">管理员视图</span>
        </div>
      </div>
    </aside>
  );
}
