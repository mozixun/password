import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Shield,
  Search,
  LayoutGrid,
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Paperclip,
  Wand2,
  ShieldCheck,
  FolderOpen,
  FolderPlus,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Smartphone,
  X,
  Bell,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

// 导航项类型
interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const { ui, auth, folders, vaults, notifications } = useStore();
  const { t } = useTranslation();
  const collapsed = ui.sidebarCollapsed;
  const toggleSidebar = ui.toggleSidebar;
  const navigate = useNavigate();
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { path: '/items', labelKey: 'allItems', icon: <LayoutGrid size={18} /> },
    { path: '/authenticator', labelKey: 'authenticator', icon: <Smartphone size={18} /> },
    { path: '/items?type=login', labelKey: 'login', icon: <KeyRound size={18} /> },
    { path: '/items?type=credit_card', labelKey: 'creditCard', icon: <CreditCard size={18} /> },
    { path: '/items?type=identity', labelKey: 'identity', icon: <User size={18} /> },
    { path: '/items?type=note', labelKey: 'secureNote', icon: <FileText size={18} /> },
    { path: '/items?type=ssh_key', labelKey: 'sshKey', icon: <Terminal size={18} /> },
    { path: '/items?type=document', labelKey: 'document', icon: <Paperclip size={18} /> },
    { path: '/items?type=passkey', labelKey: 'passkey', icon: <Fingerprint size={18} /> },
  ];

  const toolNavItems: NavItem[] = [
    { path: '/generator', labelKey: 'passwordGenerator', icon: <Wand2 size={18} /> },
    { path: '/watchtower', labelKey: 'securityCenter', icon: <ShieldCheck size={18} /> },
  ];

  const bottomNavItems: NavItem[] = [
    { path: '/vaults', labelKey: 'vaults', icon: <FolderOpen size={18} /> },
    { path: '/notifications', labelKey: 'notifications', icon: <Bell size={18} /> },
    { path: '/settings', labelKey: 'settings', icon: <Settings size={18} /> },
  ];

  const isNavItemActive = (to: string) => {
    const toUrl = new URL(to, window.location.origin);
    const toPathname = toUrl.pathname;
    const toSearch = toUrl.search;
    const currentPathname = location.pathname;
    const currentSearch = location.search;

    if (currentPathname !== toPathname) {
      return false;
    }

    if (!toSearch) {
      const currentParams = new URLSearchParams(currentSearch);
      return !currentParams.has('type') && !currentParams.has('folder');
    }

    const toParams = new URLSearchParams(toSearch);
    const currentParams = new URLSearchParams(currentSearch);

    for (const [key, value] of toParams) {
      if (currentParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentVaultId = vaults.currentVaultId;
  const currentFolders = folders.list.filter(f => f.vaultId === currentVaultId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      folders.addFolder({ vaultId: currentVaultId, name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-vault-surface/60 backdrop-blur-2xl border-r border-vault-border/50 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo 区域 */}
      <div className={cn('flex items-center gap-2 px-4 h-16 border-b border-vault-border/50', collapsed ? 'justify-center' : '')}>
        <Shield size={24} className="text-vault-accent shrink-0" />
        {!collapsed && (
          <span className="font-display font-bold text-lg text-vault-text tracking-tight">
            VaultKey
          </span>
        )}
      </div>

      {/* 搜索栏 */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-vault-text-muted text-sm">
            <Search size={14} />
            <input
              type="text"
              placeholder={t.common.search}
              value={searchQuery}
              className="bg-transparent outline-none flex-1 text-vault-text placeholder-vault-text-muted"
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (value) {
                  navigate(`/items?q=${value}`);
                }
              }}
            />
            <kbd className="ml-auto text-[10px] bg-vault-hover px-1.5 py-0.5 rounded text-vault-text-secondary">⌘K</kbd>
          </div>
        </div>
      )}

      {/* 折叠时的搜索图标 */}
      {collapsed && (
        <div className="flex justify-center py-3">
          <button
            className="p-2 rounded-lg text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
            onClick={() => ui.toggleSidebar()}
          >
            <Search size={18} />
          </button>
        </div>
      )}

      {/* 主导航 */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              cn(
                'sidebar-item',
                isNavItemActive(item.path) && 'active',
                collapsed && 'justify-center px-0'
              )
            }
            title={collapsed ? t.sidebar[item.labelKey as keyof typeof t.sidebar] : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate text-sm">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>}
          </NavLink>
        ))}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border/50" />

        {/* 文件夹区域 */}
        {!collapsed && (
          <div className="px-2">
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-vault-text-muted font-semibold uppercase tracking-wider">
              <span>{t.sidebar.folders}</span>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-0.5 rounded hover:bg-vault-hover transition-colors"
                title={t.common.newFolder}
              >
                <FolderPlus size={12} />
              </button>
            </div>
            <div className="space-y-0.5 mt-1">
              {currentFolders.map((folder) => (
                <NavLink
                  key={folder.id}
                  to={`/items?folder=${folder.id}`}
                  className={() =>
                    cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                      isNavItemActive(`/items?folder=${folder.id}`)
                        ? 'bg-vault-accent/10 text-vault-accent'
                        : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text'
                    )
                  }
                >
                  <FolderOpen size={14} />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs text-vault-text-muted">{folder.itemCount}</span>
                </NavLink>
              ))}
              {currentFolders.length === 0 && (
                <p className="px-2 py-2 text-xs text-vault-text-muted">暂无文件夹</p>
              )}
            </div>
          </div>
        )}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border/50" />

        {/* 工具导航 */}
        {toolNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              cn(
                'sidebar-item',
                isNavItemActive(item.path) && 'active',
                collapsed && 'justify-center px-0'
              )
            }
            title={collapsed ? t.sidebar[item.labelKey as keyof typeof t.sidebar] : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate text-sm">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>}
          </NavLink>
        ))}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border/50" />

        {/* 底部导航 */}
        {bottomNavItems.map((item) => {
          const isNotification = item.path === '/notifications';
          const showBadge = isNotification && notifications.unreadCount > 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={() =>
                cn(
                  'sidebar-item relative',
                  isNavItemActive(item.path) && 'active',
                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? t.sidebar[item.labelKey as keyof typeof t.sidebar] : undefined}
            >
              <span className="shrink-0 relative">
                {item.icon}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center text-[10px] font-bold bg-vault-warn text-white rounded-full px-1">
                    {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && (
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>
                  {showBadge && (
                    <span className="min-w-[18px] h-4 flex items-center justify-center text-[10px] font-bold bg-vault-warn text-white rounded-full px-1.5">
                      {notifications.unreadCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 底部：用户信息 + 锁定 + 折叠按钮 */}
      <div className="border-t border-vault-border p-2 space-y-1">
        {/* 用户信息 */}
        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg w-full transition-colors',
            collapsed ? 'justify-center' : '',
            'hover:bg-vault-hover'
          )}
        >
          {/* 用户头像 */}
          <div className="w-8 h-8 rounded-full bg-vault-accent/20 flex items-center justify-center shrink-0">
            <span className="text-vault-accent text-xs font-semibold">
              {auth.email.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <span className="text-sm text-vault-text-secondary truncate flex-1 text-left">
              {auth.email}
            </span>
          )}
        </button>

        {/* 锁定按钮 */}
        <button
          onClick={auth.lock}
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg w-full text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title={t.common.lock}
        >
          <Lock size={16} />
          {!collapsed && <span className="text-sm">{t.common.lock}</span>}
        </button>

        {/* 折叠/展开按钮 */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg text-vault-text-muted hover:bg-vault-hover hover:text-vault-text transition-colors w-full',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? t.common.expandSidebar : t.common.collapseSidebar}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-sm">{t.common.collapseSidebar}</span>}
        </button>
      </div>

      {/* 新建文件夹弹窗 */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-vault-text">{t.common.newFolder}</h3>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="p-1 rounded hover:bg-vault-hover transition-colors"
              >
                <X size={18} className="text-vault-text-muted" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={t.common.newFolder}
              className="vault-input w-full mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="vault-btn-secondary flex-1 text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleCreateFolder}
                className="vault-btn-primary flex-1 text-sm"
                disabled={!newFolderName.trim()}
              >
                {t.common.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
