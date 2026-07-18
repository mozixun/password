import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
  Trash2,
  Star,
  Edit3,
  MoreHorizontal,
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
    { path: '/items?favorite=true', labelKey: 'favorites', icon: <Star size={18} /> },
    { path: '/trash', labelKey: 'trash', icon: <Trash2 size={18} /> },
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
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [activeFolderMenu, setActiveFolderMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭文件夹菜单
  useEffect(() => {
    if (!activeFolderMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveFolderMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFolderMenu]);

  const currentVaultId = vaults.currentVaultId;
  const currentFolders = folders.list.filter(f => f.vaultId === currentVaultId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      folders.addFolder({ vaultId: currentVaultId, name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  const handleStartEditFolder = (folderId: string, folderName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(folderName);
    setActiveFolderMenu(null);
  };

  const handleSaveEditFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      folders.updateFolder(editingFolderId, { name: editingFolderName.trim() });
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (window.confirm(`确定要删除文件夹 "${folderName}" 吗？文件夹中的项目不会被删除，只是会移出此文件夹。`)) {
      folders.deleteFolder(folderId);
      setActiveFolderMenu(null);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-vault-surface border-r border-vault-border transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo 区域 — 终端 wordmark */}
      <div className={cn('flex items-center gap-2 px-4 h-12 border-b border-vault-border', collapsed ? 'justify-center' : '')}>
        <Shield size={18} className="text-vault-accent shrink-0" />
        {!collapsed && (
          <span className="font-mono font-bold text-sm text-vault-text tracking-mono-wide uppercase">
            vaultkey
          </span>
        )}
      </div>

      {/* 搜索栏 — 终端 prompt */}
      {!collapsed && (
        <div className="px-2 py-2 border-b border-vault-border">
          <div className="flex items-center gap-2 bg-vault-bg border border-vault-border rounded-none px-2.5 py-1.5 text-vault-text-muted text-log">
            <span className="text-vault-accent">$</span>
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
            <kbd className="ml-auto text-[10px] bg-vault-surface border border-vault-border px-1 py-0.5 text-vault-text-secondary tracking-mono-wide">⌘K</kbd>
          </div>
        </div>
      )}

      {/* 折叠时的搜索图标 */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-vault-border">
          <button
            className="p-1.5 rounded-none text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
            onClick={() => ui.toggleSidebar()}
            aria-label={t.common.search}
          >
            <Search size={16} />
          </button>
        </div>
      )}

      {/* 主导航 */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-px">
        {!collapsed && (
          <div className="px-2 pb-1 text-caps text-vault-text-muted">§ items</div>
        )}
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
            {!collapsed && <span className="truncate text-log">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>}
          </NavLink>
        ))}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border" />

        {/* 文件夹区域 */}
        {!collapsed && (
          <div className="px-1">
            <div className="flex items-center justify-between px-2 py-1 text-caps text-vault-text-muted">
              <span>§ {t.sidebar.folders}</span>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-0.5 rounded-none hover:bg-vault-hover hover:text-vault-text transition-colors"
                title={t.common.newFolder}
                aria-label={t.common.newFolder}
              >
                <FolderPlus size={12} />
              </button>
            </div>
            <div className="space-y-px mt-1">
              {currentFolders.map((folder) => (
                <div key={folder.id} className="relative group">
                  {editingFolderId === folder.id ? (
                    <div className="flex items-center gap-2 px-2 py-1.5 border border-vault-accent/40 bg-vault-accent/5">
                      <FolderOpen size={13} className="text-vault-text-muted" />
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="bg-transparent outline-none text-log text-vault-text flex-1 min-w-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditFolder();
                          if (e.key === 'Escape') {
                            setEditingFolderId(null);
                            setEditingFolderName('');
                          }
                        }}
                        onBlur={handleSaveEditFolder}
                      />
                    </div>
                  ) : (
                    <NavLink
                      to={`/items?folder=${folder.id}`}
                      className={() =>
                        cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded-none text-log transition-colors border border-transparent',
                          isNavItemActive(`/items?folder=${folder.id}`)
                            ? 'bg-vault-accent/10 text-vault-accent border-vault-border'
                            : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text'
                        )
                      }
                    >
                      <FolderOpen size={13} />
                      <span className="truncate flex-1">{folder.name}</span>
                      <span className="text-[11px] text-vault-text-muted tabular-nums">{folder.itemCount}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveFolderMenu(activeFolderMenu === folder.id ? null : folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-none hover:bg-vault-hover/50 transition-all"
                        title="更多操作"
                        aria-label="更多操作"
                      >
                        <MoreHorizontal size={12} />
                      </button>
                    </NavLink>
                  )}
                  {activeFolderMenu === folder.id && (
                    <div ref={menuRef} className="absolute right-0 top-full mt-0.5 w-36 bg-vault-surface border border-vault-border shadow-xl py-0.5 z-50 animate-fade-in">
                      <button
                        onClick={() => handleStartEditFolder(folder.id, folder.name)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-log text-vault-text hover:bg-vault-hover transition-colors"
                      >
                        <Edit3 size={13} />
                        重命名
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-log text-vault-warn hover:bg-vault-warn/10 transition-colors"
                      >
                        <Trash2 size={13} />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {currentFolders.length === 0 && (
                <p className="px-2 py-1.5 text-hash">// no folders</p>
              )}
            </div>
          </div>
        )}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border" />

        {/* 工具导航 */}
        {!collapsed && (
          <div className="px-2 pb-1 text-caps text-vault-text-muted">§ tools</div>
        )}
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
            {!collapsed && <span className="truncate text-log">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>}
          </NavLink>
        ))}

        {/* 分隔线 */}
        <div className="my-2 border-t border-vault-border" />

        {/* 底部导航 */}
        {!collapsed && (
          <div className="px-2 pb-1 text-caps text-vault-text-muted">§ system</div>
        )}
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
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center text-[10px] font-bold bg-vault-warn text-white px-1 tabular-nums">
                    {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-log">{t.sidebar[item.labelKey as keyof typeof t.sidebar]}</span>
                  {showBadge && (
                    <span className="min-w-[18px] h-4 flex items-center justify-center text-[10px] font-bold bg-vault-warn text-white px-1 tabular-nums">
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
      <div className="border-t border-vault-border p-1.5 space-y-px">
        {/* 用户信息 — 终端 user@host 样式 */}
        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-none w-full transition-colors border border-transparent hover:bg-vault-hover hover:border-vault-border',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? auth.email : undefined}
        >
          {/* 用户头像 — 方块 mono */}
          <div className="w-6 h-6 rounded-none bg-vault-accent/15 border border-vault-accent/30 flex items-center justify-center shrink-0">
            <span className="text-vault-accent text-[11px] font-bold uppercase">
              {auth.email.charAt(0)}
            </span>
          </div>
          {!collapsed && (
            <span className="text-log text-vault-text-secondary truncate flex-1 text-left">
              {auth.email}
            </span>
          )}
        </button>

        {/* 锁定按钮 */}
        <button
          onClick={auth.lock}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-none w-full text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 hover:border-vault-warn/30 border border-transparent transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title={t.common.lock}
        >
          <Lock size={14} />
          {!collapsed && <span className="text-log uppercase tracking-mono-wide">{t.common.lock}</span>}
        </button>

        {/* 折叠/展开按钮 */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-none text-vault-text-muted hover:bg-vault-hover hover:text-vault-text hover:border-vault-border border border-transparent transition-colors w-full',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? t.common.expandSidebar : t.common.collapseSidebar}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span className="text-log uppercase tracking-mono-wide">{t.common.collapseSidebar}</span>}
        </button>
      </div>

      {/* 新建文件夹弹窗 — 终端对话框 */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-vault-surface border border-vault-border rounded-none p-5 w-80 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-vault-border">
              <h3 className="text-caps text-vault-text">§ {t.common.newFolder}</h3>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="p-1 rounded-none hover:bg-vault-hover transition-colors"
                aria-label="关闭"
              >
                <X size={14} className="text-vault-text-muted" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="folder-name"
              className="vault-input w-full mb-4 text-log"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="vault-btn-secondary flex-1 text-log uppercase tracking-mono-wide"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleCreateFolder}
                className="vault-btn-primary flex-1 text-log uppercase tracking-mono-wide"
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
