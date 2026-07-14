import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Download,
  FileText,
  Code,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface DocItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const docItems: DocItem[] = [
  { path: '/docs/installation', label: '安装指南', icon: <Download size={18} /> },
  { path: '/docs/usage', label: '使用指南', icon: <FileText size={18} /> },
  { path: '/docs/development', label: '开发指南', icon: <Code size={18} /> },
  { path: '/docs/api', label: 'API 文档', icon: <BookOpen size={18} /> },
  { path: '/docs/security', label: '安全文档', icon: <Shield size={18} /> },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const getCurrentDocTitle = () => {
    const current = docItems.find((item) => location.pathname.startsWith(item.path));
    return current?.label || '文档';
  };

  return (
    <div className="min-h-screen bg-vault-bg">
      <div className="flex min-h-screen">
        {/* 桌面端侧边栏 */}
        <aside className="hidden md:flex flex-col w-64 bg-vault-surface/60 backdrop-blur-2xl border-r border-vault-border/50 shrink-0">
          <div className="flex items-center gap-2 px-6 h-16 border-b border-vault-border/50">
            <BookOpen size={24} className="text-vault-accent" />
            <span className="font-display font-bold text-lg text-vault-text">文档中心</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {docItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-vault-accent/10 text-vault-accent font-medium'
                      : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text'
                  )
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <ChevronRight size={14} className="text-vault-text-muted" />
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-vault-border/50">
            <p className="text-xs text-vault-text-muted">
              VaultKey v1.0.0
            </p>
          </div>
        </aside>

        {/* 移动端顶部栏 */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-vault-surface/80 backdrop-blur-xl border-b border-vault-border/50">
          <div className="flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-vault-text-secondary hover:bg-vault-hover transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="font-display font-semibold text-vault-text">
              {getCurrentDocTitle()}
            </span>
          </div>
        </div>

        {/* 移动端侧边栏遮罩 */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 h-full w-72 bg-vault-surface shadow-xl">
              <div className="flex items-center justify-between px-4 h-14 border-b border-vault-border/50">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-vault-accent" />
                  <span className="font-display font-semibold text-vault-text">文档中心</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-vault-text-secondary hover:bg-vault-hover transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="overflow-y-auto px-3 py-4 space-y-1">
                {docItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-vault-accent/10 text-vault-accent font-medium'
                          : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text'
                      )
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
          <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
