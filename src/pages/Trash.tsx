import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Paperclip,
  Fingerprint,
  Smartphone,
  Shield,
  Building2,
  Database,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu';
import { useItems, useVaults } from '@/store';
import { cn } from '@/lib/utils';
import type { ItemType, VaultItem } from '@/types';

const typeFilters = [
  { key: 'all', label: '全部', icon: null },
  { key: 'login', label: '登录', icon: <KeyRound size={14} /> },
  { key: 'credit_card', label: '信用卡', icon: <CreditCard size={14} /> },
  { key: 'identity', label: '身份', icon: <User size={14} /> },
  { key: 'note', label: '笔记', icon: <FileText size={14} /> },
  { key: 'ssh_key', label: 'SSH', icon: <Terminal size={14} /> },
  { key: 'document', label: '文档', icon: <Paperclip size={14} /> },
  { key: 'passkey', label: '通行密钥', icon: <Fingerprint size={14} /> },
  { key: 'totp_authenticator', label: '验证器', icon: <Smartphone size={14} /> },
  { key: 'license', label: 'License', icon: <Shield size={14} /> },
  { key: 'id_card', label: '身份证', icon: <CreditCard size={14} /> },
  { key: 'database', label: '数据库', icon: <Database size={14} /> },
  { key: 'api_key', label: 'API Key', icon: <KeyRound size={14} /> },
] as const;

function getItemTypeIcon(type: ItemType) {
  const iconMap: Record<ItemType, React.ReactNode> = {
    login: <KeyRound size={16} />,
    credit_card: <CreditCard size={16} />,
    identity: <User size={16} />,
    note: <FileText size={16} />,
    ssh_key: <Terminal size={16} />,
    document: <Paperclip size={16} />,
    passkey: <Fingerprint size={16} />,
    totp_authenticator: <Smartphone size={16} />,
    license: <Shield size={16} />,
    id_card: <Building2 size={16} />,
    database: <Database size={16} />,
    api_key: <KeyRound size={16} />,
  };
  return iconMap[type];
}

function getItemTypeBg(type: ItemType): string {
  const bgMap: Record<ItemType, string> = {
    login: 'bg-vault-accent/15 text-vault-accent',
    credit_card: 'bg-vault-blue/15 text-vault-blue',
    identity: 'bg-vault-purple/15 text-vault-purple',
    note: 'bg-vault-orange/15 text-vault-orange',
    ssh_key: 'bg-vault-accent/15 text-vault-accent',
    document: 'bg-vault-blue/15 text-vault-blue',
    passkey: 'bg-vault-accent/15 text-vault-accent',
    totp_authenticator: 'bg-vault-purple/15 text-vault-purple',
    license: 'bg-vault-accent/15 text-vault-accent',
    id_card: 'bg-vault-blue/15 text-vault-blue',
    database: 'bg-vault-purple/15 text-vault-purple',
    api_key: 'bg-vault-orange/15 text-vault-orange',
  };
  return bgMap[type];
}

export default function Trash() {
  const itemsStore = useItems();
  const vaultsStore = useVaults();
  const {
    list: items,
    searchQuery,
    setSearchQuery,
    selectedItemIds,
    selectAll,
    clearSelection,
    restoreItem,
    permanentDeleteItem,
    restoreSelected,
    permanentDeleteSelected,
    emptyTrash,
    toggleSelect,
  } = itemsStore;
  const { list: vaults } = vaultsStore;

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showVaultDropdown, setShowVaultDropdown] = useState(false);
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuSelectedItem, setContextMenuSelectedItem] = useState<VaultItem | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const trashedItems = useMemo(() => {
    return items.filter((item) => item.trashedAt);
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = trashedItems;

    if (selectedVaultFilter !== 'all') {
      result = result.filter((item) => item.vaultId === selectedVaultFilter);
    }

    if (activeTypeFilter !== 'all') {
      result = result.filter((item) => item.type === activeTypeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.username?.toLowerCase().includes(query) ||
          item.url?.toLowerCase().includes(query),
      );
    }

    switch (sortBy) {
      case 'recent':
        return [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'title-asc':
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      case 'oldest':
        return [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'trashed-desc':
        return [...result].sort((a, b) => new Date(b.trashedAt!).getTime() - new Date(a.trashedAt!).getTime());
      default:
        return result;
    }
  }, [trashedItems, selectedVaultFilter, activeTypeFilter, searchQuery, sortBy]);

  const handleRestore = useCallback(
    (id: string) => {
      if (window.confirm('确定要恢复此条目吗？')) {
        restoreItem(id);
      }
    },
    [restoreItem],
  );

  const handlePermanentDelete = useCallback(
    (id: string) => {
      if (window.confirm('确定要永久删除此条目吗？此操作不可撤销！')) {
        permanentDeleteItem(id);
      }
    },
    [permanentDeleteItem],
  );

  const handleRestoreSelected = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    if (window.confirm(`确定要恢复选中的 ${selectedItemIds.length} 个条目吗？`)) {
      restoreSelected();
    }
  }, [selectedItemIds, restoreSelected]);

  const handlePermanentDeleteSelected = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    if (window.confirm(`确定要永久删除选中的 ${selectedItemIds.length} 个条目吗？此操作不可撤销！`)) {
      permanentDeleteSelected();
    }
  }, [selectedItemIds, permanentDeleteSelected]);

  const handleEmptyTrash = useCallback(() => {
    if (trashedItems.length === 0) return;
    if (window.confirm(`确定要清空回收站吗？共 ${trashedItems.length} 个条目将被永久删除，此操作不可撤销！`)) {
      emptyTrash();
    }
  }, [trashedItems.length, emptyTrash]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: VaultItem) => {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuSelectedItem(item);
      setIsContextMenuOpen(true);
    },
    [],
  );

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'restore',
      label: '恢复',
      icon: <RotateCcw size={14} />,
      onClick: () => {
        if (contextMenuSelectedItem) handleRestore(contextMenuSelectedItem.id);
        setIsContextMenuOpen(false);
      },
    },
    {
      id: 'permanent-delete',
      label: '永久删除',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => {
        if (contextMenuSelectedItem) handlePermanentDelete(contextMenuSelectedItem.id);
        setIsContextMenuOpen(false);
      },
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVaultName = (vaultId: string) => {
    return vaults.find((v) => v.id === vaultId)?.name || '未知';
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col animate-fade-in">
        <div className="px-6 py-4 border-b border-vault-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vault-warn/15 flex items-center justify-center">
              <Trash2 size={20} className="text-vault-warn" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vault-text">回收站</h1>
              <p className="text-sm text-vault-text-muted">
                共 {trashedItems.length} 个已删除条目，30 天后将自动永久删除
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedItemIds.length > 0 && (
              <>
                <button
                  onClick={handleRestoreSelected}
                  className="vault-btn-secondary flex items-center gap-2 text-sm"
                >
                  <RotateCcw size={14} />
                  恢复选中
                </button>
                <button
                  onClick={handlePermanentDeleteSelected}
                  className="vault-btn-danger flex items-center gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  永久删除选中
                </button>
                <div className="w-px h-6 bg-vault-border mx-1" />
              </>
            )}
            <button
              onClick={handleEmptyTrash}
              disabled={trashedItems.length === 0}
              className="vault-btn-danger flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              清空回收站
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-vault-border/50 flex items-center gap-3 shrink-0">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-muted" />
            <input
              type="text"
              placeholder="搜索回收站中的条目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vault-input w-full pl-9"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowVaultDropdown(!showVaultDropdown);
                setShowSortDropdown(false);
              }}
              className="vault-btn-secondary flex items-center gap-2 text-sm"
            >
              {selectedVaultFilter === 'all' ? '所有保险库' : getVaultName(selectedVaultFilter)}
              <ChevronDown size={14} />
            </button>
            {showVaultDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-vault-surface border border-vault-border rounded-xl shadow-xl py-1 z-50">
                <button
                  onClick={() => {
                    setSelectedVaultFilter('all');
                    setShowVaultDropdown(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-vault-hover transition-colors',
                    selectedVaultFilter === 'all' && 'text-vault-accent',
                  )}
                >
                  所有保险库
                </button>
                {vaults.map((vault) => (
                  <button
                    key={vault.id}
                    onClick={() => {
                      setSelectedVaultFilter(vault.id);
                      setShowVaultDropdown(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-vault-hover transition-colors',
                      selectedVaultFilter === vault.id && 'text-vault-accent',
                    )}
                  >
                    {vault.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowVaultDropdown(false);
              }}
              className="vault-btn-secondary flex items-center gap-2 text-sm"
            >
              排序
              <ChevronDown size={14} />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-vault-surface border border-vault-border rounded-xl shadow-xl py-1 z-50">
                {[
                  { key: 'trashed-desc', label: '删除时间（最新）' },
                  { key: 'recent', label: '最近修改' },
                  { key: 'title-asc', label: '标题 A-Z' },
                  { key: 'oldest', label: '最早创建' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSortBy(opt.key);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-vault-hover transition-colors',
                      sortBy === opt.key && 'text-vault-accent',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-2 border-b border-vault-border/30 flex items-center gap-1 shrink-0 overflow-x-auto">
          {typeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveTypeFilter(filter.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                activeTypeFilter === filter.key
                  ? 'bg-vault-accent/15 text-vault-accent'
                  : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text',
              )}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {selectedItemIds.length > 0 && (
          <div className="px-6 py-2 bg-vault-accent/5 border-b border-vault-border/30 flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (filteredItems.length === selectedItemIds.length) {
                  clearSelection();
                } else {
                  selectAll();
                }
              }}
              className="flex items-center gap-2 text-sm text-vault-accent"
            >
              <CheckSquare size={16} />
              已选择 {selectedItemIds.length} 个
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-vault-text-muted hover:text-vault-text transition-colors"
            >
              取消选择
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-vault-border border-t-vault-accent rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-vault-surface flex items-center justify-center mb-4">
                <Trash2 size={36} className="text-vault-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-vault-text mb-1">
                {trashedItems.length === 0 ? '回收站为空' : '没有匹配的条目'}
              </h3>
              <p className="text-sm text-vault-text-muted">
                {trashedItems.length === 0
                  ? '删除的条目会暂时移到这里，30 天后自动永久删除'
                  : '尝试调整筛选条件'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                  className={cn(
                    'vault-card flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group',
                    selectedItemIds.includes(item.id) && 'bg-vault-accent/10 border-vault-accent/30',
                  )}
                  onClick={() => toggleSelect(item.id)}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      getItemTypeBg(item.type),
                    )}
                  >
                    {getItemTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-vault-text truncate">{item.title}</h3>
                      {item.favorite && (
                        <Trash2 size={12} className="text-vault-warn shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-vault-text-muted truncate">
                      {item.username || item.subtitle || item.type}
                    </p>
                  </div>
                  <div className="text-xs text-vault-text-muted shrink-0 hidden sm:block">
                    <div>删除于 {item.trashedAt ? formatDate(item.trashedAt) : '-'}</div>
                    <div className="text-[10px]">保险库：{getVaultName(item.vaultId)}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-vault-hover text-vault-text-muted hover:text-vault-accent transition-colors"
                      title="恢复"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete(item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-vault-hover text-vault-text-muted hover:text-vault-warn transition-colors"
                      title="永久删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isContextMenuOpen && contextMenuSelectedItem && (
        <ContextMenu
          position={contextMenuPosition}
          items={contextMenuItems}
          onClose={() => setIsContextMenuOpen(false)}
        />
      )}
    </AppLayout>
  );
}