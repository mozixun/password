import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Plus, Search } from 'lucide-react';
import { useStore } from '@/store';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { createBackup, saveBackup } from '@/utils/backup';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AUTO_BACKUP_INTERVAL = 30 * 60 * 1000; // 30 分钟

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const resetActivityTimer = useStore((state) => state.auth.resetActivityTimer);
  const itemsList = useStore((state) => state.items.list);
  const vaultsList = useStore((state) => state.vaults.list);
  const lastBackupRef = useRef<number>(Date.now());

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K 打开命令面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl/Cmd+N 新建条目
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/items/new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // 自动备份定时器
  useEffect(() => {
    const timer = setInterval(() => {
      if (itemsList.length > 0 && Date.now() - lastBackupRef.current >= AUTO_BACKUP_INTERVAL) {
        const snapshot = createBackup(itemsList, vaultsList, []);
        saveBackup(snapshot);
        lastBackupRef.current = Date.now();
      }
    }, AUTO_BACKUP_INTERVAL);
    return () => clearInterval(timer);
  }, [itemsList, vaultsList]);

  // 活动计时器：监听用户活动并重置自动锁定计时器
  useEffect(() => {
    let lastCall = 0;
    const throttleMs = 5000;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastCall >= throttleMs) {
        lastCall = now;
        resetActivityTimer();
      }
    };

    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [resetActivityTimer]);

  // 面包屑（基于路由动态生成）
  const breadcrumb = location.pathname === '/dashboard' ? '仪表盘'
    : location.pathname === '/items' ? '所有项目'
    : location.pathname.startsWith('/items/detail') ? '条目详情'
    : location.pathname.startsWith('/items/new') ? '新建条目'
    : location.pathname === '/generator' ? '密码生成器'
    : location.pathname === '/authenticator' ? '验证器'
    : location.pathname === '/watchtower' ? '安全中心'
    : location.pathname === '/settings' ? '设置'
    : location.pathname === '/vaults' ? '保管库' : 'VaultKey';

  return (
    <div className="flex h-screen bg-vault-bg overflow-hidden">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* 移动端侧边栏遮罩 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 遮罩层 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* 侧边栏 */}
          <div className="relative z-10 h-full w-60">
            <Sidebar />
          </div>
        </div>
      )}

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="relative flex items-center gap-3 h-14 px-4 bg-vault-surface/60 backdrop-blur-xl shrink-0">
          {/* 移动端汉堡菜单 */}
          <button
            className="md:hidden p-1.5 rounded-lg text-vault-text-secondary hover:bg-vault-hover transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-vault-text-muted">VaultKey</span>
            <span className="text-vault-text-muted">/</span>
            <span className="text-vault-text font-medium">{breadcrumb}</span>
          </div>

          {/* 右侧操作按钮 */}
          <div className="ml-auto flex items-center gap-2">
            {/* 快速搜索按钮 */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-vault-text-muted bg-vault-hover/50 hover:bg-vault-hover transition-colors"
              onClick={() => setCommandPaletteOpen(true)}
              title="快速搜索 (Ctrl+K)"
            >
              <Search size={16} />
              <span className="hidden sm:inline">搜索...</span>
              <kbd className="hidden md:flex items-center px-1.5 py-0.5 text-xs bg-vault-surface border border-vault-border rounded">
                ⌘K
              </kbd>
            </button>

            {/* 通知 */}
            <button
              className="p-2 rounded-lg text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
            </button>

            {/* 新建项目 */}
            <button
              className="vault-btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
              onClick={() => navigate('/items/new')}
            >
              <Plus size={16} />
              <span>新建</span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-border/50 to-transparent" />
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto bg-vault-bg p-6">
          {children}
        </main>
      </div>

      {/* 命令面板 */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
