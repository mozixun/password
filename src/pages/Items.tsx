// VaultKey 密码管理器 - 项目列表页面
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  Star,
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Paperclip,
  ChevronDown,
  SlidersHorizontal,
  FolderOpen,
  Fingerprint,
  Smartphone,
  Shield,
  Building2,
  Database,
  CheckSquare,
  Trash2,
  Move,
  Download,
  ChevronUp,
  ExternalLink,
  Copy,
  GripVertical,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import ItemCard from '@/components/ItemCard';
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu';
import { useItems, useVaults, useFolders } from '@/store';
import { cn } from '@/lib/utils';
import { secureCopy } from '@/utils/clipboard';
import type { ItemType, VaultItem } from '@/types';

// ==================== 常量定义 ====================

// 类型筛选选项配置
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

// 类型中文名映射
const typeLabelMap: Record<string, string> = {
  all: '所有项目',
  login: '登录',
  credit_card: '信用卡',
  identity: '身份',
  note: '笔记',
  ssh_key: 'SSH 密钥',
  document: '文档',
  passkey: '通行密钥',
  totp_authenticator: '验证器',
  license: 'License',
  id_card: '身份证',
  database: '数据库',
  api_key: 'API Key',
};

// URL 路径段到类型键的映射
const pathToTypeMap: Record<string, string> = {
  logins: 'login',
  'credit-cards': 'credit_card',
  identities: 'identity',
  notes: 'note',
  'ssh-keys': 'ssh_key',
  documents: 'document',
};

// 排序选项
const sortOptions = [
  { key: 'recent', label: '最近修改' },
  { key: 'title-asc', label: '标题 A-Z' },
  { key: 'oldest', label: '最早创建' },
  { key: 'custom', label: '自定义排序' },
] as const;

// 类型对应的图标
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

// ==================== 主组件 ====================

export default function Items() {
  const navigate = useNavigate();
  const { type: typePath } = useParams<{ type?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { list: items, searchQuery, setSearchQuery, setItemTypeFilter, setTagFilter, tagFilter, selectAll, clearSelection, deleteSelected, moveSelected, exportSelected, selectedItemIds, toggleFavorite, deleteItem, incrementUsage, reorderItems } = useItems();
  const { list: vaults, currentVaultId, setCurrentVault } = useVaults();
  const { list: folders } = useFolders();

  // 从 URL 参数推断当前类型筛选
  const activeTypeFilter = useMemo(() => {
    if (typePath && pathToTypeMap[typePath]) {
      return pathToTypeMap[typePath];
    }
    const searchType = searchParams.get('type');
    return searchType || 'all';
  }, [typePath, searchParams]);

  // 从 URL 参数读取收藏筛选
  const initialFavoritesOnly = useMemo(() => {
    return searchParams.get('favorite') === 'true';
  }, [searchParams]);

  // 本地 UI 状态
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(initialFavoritesOnly);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showVaultDropdown, setShowVaultDropdown] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // 拖拽排序状态
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customSortEnabled, setCustomSortEnabled] = useState(false);

  // 右键菜单状态
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuSelectedItem, setContextMenuSelectedItem] = useState<VaultItem | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  // 当前保险库对象
  const currentVault = useMemo(
    () => vaults.find((v) => v.id === currentVaultId),
    [vaults, currentVaultId],
  );

  // 模拟加载动画
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [activeTypeFilter, currentVaultId]);

  // ==================== 过滤和排序逻辑 ====================

  // 当前保险库下的条目
  const vaultItems = useMemo(
    () => items.filter((item) => item.vaultId === currentVaultId && !item.trashedAt),
    [items, currentVaultId],
  );

  // 提取所有唯一标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    vaultItems.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [vaultItems]);

  // 当前保险库下的文件夹
  const currentVaultFolders = useMemo(
    () => folders.filter((f) => f.vaultId === currentVaultId),
    [folders, currentVaultId],
  );

  // 过滤后的条目
  const filteredItems = useMemo(() => {
    let result = vaultItems;

    // 类型筛选
    if (activeTypeFilter !== 'all') {
      result = result.filter((item) => item.type === activeTypeFilter);
    }

    // 文件夹筛选
    if (selectedFolderId) {
      result = result.filter((item) => item.folderId === selectedFolderId);
    }

    // 搜索筛选（根据标题、用户名、URL）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.username && item.username.toLowerCase().includes(query)) ||
          (item.url && item.url.toLowerCase().includes(query)),
      );
    }

    // 收藏筛选
    if (showFavoritesOnly) {
      result = result.filter((item) => item.favorite);
    }

    // 标签筛选
    if (tagFilter) {
      result = result.filter((item) => item.tags.includes(tagFilter));
    }

    // 排序
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'custom':
          const sortA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
          const sortB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
          if (sortA !== sortB) return sortA - sortB;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title, 'zh-CN');
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [vaultItems, activeTypeFilter, selectedFolderId, searchQuery, showFavoritesOnly, tagFilter, sortBy]);

  // ==================== 事件处理 ====================

  // 切换类型筛选
  const handleTypeFilter = useCallback(
    (key: string) => {
      if (key === 'all') {
        setItemTypeFilter(null);
        navigate('/items');
      } else {
        setItemTypeFilter(key);
        // 查找反向映射的类型路径
        const typePathEntry = Object.entries(pathToTypeMap).find(([, v]) => v === key);
        if (typePathEntry) {
          navigate(`/items/${typePathEntry[0]}`);
        } else {
          setSearchParams({ type: key });
        }
      }
    },
    [navigate, setItemTypeFilter, setSearchParams],
  );

  // 切换收藏筛选
  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
  }, []);

  // 切换排序
  const handleSort = useCallback((key: string) => {
    setSortBy(key);
    setCustomSortEnabled(key === 'custom');
    setShowSortDropdown(false);
  }, []);

  // 拖拽排序处理
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, index: number) => {
    if (!customSortEnabled) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedItemId(itemId);
    setIsDragging(true);
  }, [customSortEnabled]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!customSortEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, [customSortEnabled]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    if (!customSortEnabled || !draggedItemId) return;
    e.preventDefault();
    
    const itemIds = filteredItems.map((item) => item.id);
    const sourceIndex = itemIds.indexOf(draggedItemId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggedItemId(null);
      setIsDragging(false);
      setDragOverIndex(null);
      return;
    }

    const newIds = [...itemIds];
    newIds.splice(sourceIndex, 1);
    newIds.splice(targetIndex, 0, draggedItemId);
    reorderItems(newIds);

    setDraggedItemId(null);
    setIsDragging(false);
    setDragOverIndex(null);
  }, [customSortEnabled, draggedItemId, filteredItems, reorderItems]);

  // 切换保险库
  const handleVaultChange = useCallback(
    (vaultId: string) => {
      setCurrentVault(vaultId);
      setShowVaultDropdown(false);
    },
    [setCurrentVault],
  );

  // 切换标签筛选
  const handleTagFilter = useCallback(
    (tag: string | null) => {
      setTagFilter(tag === tagFilter ? null : tag);
    },
    [tagFilter, setTagFilter],
  );

  // 新建项目
  const handleNewItem = useCallback(() => {
    navigate('/items/new');
  }, [navigate]);

  // 全选
  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  // 批量删除
  const handleBatchDelete = useCallback(() => {
    if (selectedItemIds.length > 0 && window.confirm(`确定要删除选中的 ${selectedItemIds.length} 个项目吗？`)) {
      deleteSelected();
    }
  }, [selectedItemIds, deleteSelected]);

  // 批量移动
  const handleBatchMove = useCallback((folderId: string) => {
    moveSelected(folderId);
    setShowMoveDropdown(false);
  }, [moveSelected]);

  // 批量导出
  const handleBatchExport = useCallback(() => {
    const data = exportSelected();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultkey-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    clearSelection();
  }, [exportSelected, clearSelection]);

  // 点击搜索框聚焦
  const searchInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      // ⌘K 快捷键聚焦搜索框
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          node.focus();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // 右键菜单处理
  const handleContextMenu = useCallback(
    (e: React.MouseEvent | React.TouchEvent, item: VaultItem) => {
      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      setContextMenuPosition({ x: clientX, y: clientY });
      setContextMenuSelectedItem(item);
      setIsContextMenuOpen(true);
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setIsContextMenuOpen(false);
    setContextMenuSelectedItem(null);
  }, []);

  // 右键菜单项
  const contextMenuItems = useMemo((): ContextMenuItem[] => {
    if (!contextMenuSelectedItem) return [];

    const item = contextMenuSelectedItem;

    return [
      {
        id: 'open',
        label: '打开',
        icon: <ExternalLink size={14} />,
        onClick: () => {
          if (contextMenuSelectedItem) {
            navigate(`/items/detail/${contextMenuSelectedItem.id}`);
          }
        },
      },
      {
        id: 'divider-1',
        label: '',
        divider: true,
        onClick: () => {},
      },
      {
        id: 'copy-username',
        label: '复制用户名',
        icon: <Copy size={14} />,
        onClick: async () => {
          if (contextMenuSelectedItem?.username) {
            const success = await secureCopy(contextMenuSelectedItem.username);
            if (success) {
              incrementUsage(contextMenuSelectedItem.id);
            }
          }
        },
        disabled: !item.username,
      },
      {
        id: 'copy-password',
        label: '复制密码',
        icon: <Copy size={14} />,
        onClick: async () => {
          if (contextMenuSelectedItem?.password) {
            const success = await secureCopy(contextMenuSelectedItem.password);
            if (success) {
              incrementUsage(contextMenuSelectedItem.id);
            }
          }
        },
        disabled: !item.password,
      },
      {
        id: 'divider-2',
        label: '',
        divider: true,
        onClick: () => {},
      },
      {
        id: 'favorite',
        label: item.favorite ? '取消收藏' : '收藏',
        icon: <Star size={14} className={item.favorite ? 'fill-vault-orange' : ''} />,
        onClick: () => {
          if (contextMenuSelectedItem) {
            toggleFavorite(contextMenuSelectedItem.id);
          }
        },
      },
      {
        id: 'divider-3',
        label: '',
        divider: true,
        onClick: () => {},
      },
      {
        id: 'delete',
        label: '删除',
        icon: <Trash2 size={14} />,
        onClick: () => {
          if (contextMenuSelectedItem) {
            if (window.confirm(`确定要删除项目 "${contextMenuSelectedItem.title}" 吗？`)) {
              deleteItem(contextMenuSelectedItem.id);
            }
          }
        },
        danger: true,
      },
    ];
  }, [contextMenuSelectedItem, navigate, toggleFavorite, deleteItem, incrementUsage]);

  // 页面标题
  const pageTitle = typeLabelMap[activeTypeFilter] || '所有项目';

  // ==================== 骨架屏渲染 ====================

  const renderSkeleton = () => (
    <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="vault-card p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-vault-hover shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-vault-hover rounded w-2/3" />
              <div className="h-3 bg-vault-hover rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ==================== 空状态渲染 ====================

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-vault-hover flex items-center justify-center mb-4">
        <FolderOpen size={28} className="text-vault-text-muted" />
      </div>
      <h3 className="text-base font-medium text-vault-text mb-1">没有找到项目</h3>
      <p className="text-sm text-vault-text-secondary mb-4">
        {searchQuery || activeTypeFilter !== 'all' || tagFilter
          ? '尝试调整筛选条件或搜索关键词'
          : '点击上方按钮创建你的第一个项目'}
      </p>
      {!searchQuery && activeTypeFilter === 'all' && !tagFilter && (
        <button
          className="vault-btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
          onClick={handleNewItem}
        >
          <Plus size={16} />
          新建项目
        </button>
      )}
    </div>
  );

  // ==================== 列表视图渲染 ====================

  const ListItem = ({ item, onContextMenu, index, onDragStart, onDragOver, onDragLeave, onDrop, isDragging, dragOverIndex, customSortEnabled }: { item: typeof filteredItems[number]; onContextMenu: (e: React.MouseEvent | React.TouchEvent, item: typeof filteredItems[number]) => void; index: number; onDragStart: (e: React.DragEvent, itemId: string, index: number) => void; onDragOver: (e: React.DragEvent, index: number) => void; onDragLeave: () => void; onDrop: (e: React.DragEvent, index: number) => void; isDragging: boolean; dragOverIndex: number | null; customSortEnabled: boolean }) => {
    const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [isLongPress, setIsLongPress] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
      const timer = setTimeout(() => {
        setIsLongPress(true);
        onContextMenu(e, item);
      }, 500);
      setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setIsLongPress(false);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e, item);
    };

    const isDragOver = dragOverIndex === index;
    const isDragged = isDragging && draggedItemId === item.id;

    return (
      <div
        className={cn(
          'vault-card flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
          isDragOver ? 'ring-2 ring-vault-accent ring-offset-2' : 'hover:bg-vault-hover/50',
          isDragged && 'opacity-50',
        )}
        onClick={() => {
          if (!isLongPress) navigate(`/items/detail/${item.id}`);
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        draggable={customSortEnabled}
        onDragStart={(e) => onDragStart(e, item.id, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, index)}
      >
        {/* 拖拽手柄 */}
        {customSortEnabled && (
          <div className="p-1.5 text-vault-text-muted hover:text-vault-text cursor-grab active:cursor-grabbing transition-colors shrink-0">
            <GripVertical size={14} />
          </div>
        )}

        {/* 图标 */}
        <div className="w-8 h-8 rounded-lg bg-vault-accent/15 text-vault-accent flex items-center justify-center shrink-0">
          {getItemTypeIcon(item.type)}
        </div>

        {/* 标题 + 用户名 */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-sm font-medium text-vault-text truncate">{item.title}</span>
          {item.username && (
            <span className="text-xs text-vault-text-secondary truncate hidden sm:inline">
              {item.username}
            </span>
          )}
        </div>

        {/* 标签（行内显示） */}
        {item.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="vault-badge bg-vault-hover text-vault-text-secondary">
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-vault-text-muted">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* 收藏标记 */}
        {item.favorite && (
          <Star size={14} className="text-vault-orange fill-vault-orange shrink-0" />
        )}
      </div>
    );
  };

  const renderListItem = (item: typeof filteredItems[number], index: number) => (
    <ListItem
      key={item.id}
      item={item}
      index={index}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      isDragging={isDragging}
      dragOverIndex={dragOverIndex}
      customSortEnabled={customSortEnabled}
    />
  );

  // ==================== 页面渲染 ====================

  return (
    <AppLayout>
      <div className="flex gap-6 h-full">
        {/* 主内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 顶部：标题 + 操作 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-vault-text">{pageTitle}</h1>
              <span className="text-xs font-medium bg-vault-hover text-vault-text-secondary px-2 py-0.5 rounded-full">
                {filteredItems.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 新建项目按钮 */}
              <button
                className="vault-btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
                onClick={handleNewItem}
              >
                <Plus size={16} />
                新建项目
              </button>

              {/* 视图切换 */}
              <div className="flex items-center border border-vault-border rounded-lg overflow-hidden">
                <button
                  className={cn(
                    'p-1.5 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-vault-accent/15 text-vault-accent'
                      : 'text-vault-text-muted hover:text-vault-text hover:bg-vault-hover',
                  )}
                  onClick={() => setViewMode('grid')}
                  title="网格视图"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={cn(
                    'p-1.5 transition-colors',
                    viewMode === 'list'
                      ? 'bg-vault-accent/15 text-vault-accent'
                      : 'text-vault-text-muted hover:text-vault-text hover:bg-vault-hover',
                  )}
                  onClick={() => setViewMode('list')}
                  title="列表视图"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="space-y-3 mb-5">
            {/* 搜索框 */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full bg-vault-surface border border-vault-border rounded-lg pl-9 pr-10 py-2 text-sm text-vault-text placeholder:text-vault-text-muted focus:outline-none focus:border-vault-accent/50 focus:ring-1 focus:ring-vault-accent/25 transition-colors"
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-vault-hover px-1.5 py-0.5 rounded text-vault-text-secondary pointer-events-none">
                ⌘K
              </kbd>
            </div>

            {/* 类型筛选标签 + 排序 + 收藏 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 类型筛选标签 */}
              <div className="flex items-center gap-1 flex-wrap">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      activeTypeFilter === filter.key
                        ? 'bg-vault-accent/15 text-vault-accent'
                        : 'bg-vault-hover text-vault-text-secondary hover:text-vault-text',
                    )}
                    onClick={() => handleTypeFilter(filter.key)}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* 分隔符 */}
              <div className="w-px h-5 bg-vault-border hidden sm:block" />

              {/* 排序下拉 */}
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <SlidersHorizontal size={13} />
                  {sortOptions.find((o) => o.key === sortBy)?.label}
                  <ChevronDown size={12} />
                </button>

                {showSortDropdown && (
                  <>
                    {/* 点击外部关闭 */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-vault-surface border border-vault-border rounded-lg shadow-lg py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.key}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-xs transition-colors',
                            sortBy === option.key
                              ? 'text-vault-accent bg-vault-accent/10'
                              : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text',
                          )}
                          onClick={() => handleSort(option.key)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 仅收藏开关 */}
              <button
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors',
                  showFavoritesOnly
                    ? 'bg-vault-orange/15 text-vault-orange'
                    : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text',
                )}
                onClick={handleToggleFavorites}
                title="仅显示收藏"
              >
                <Star size={13} className={showFavoritesOnly ? 'fill-vault-orange' : ''} />
                收藏
              </button>
            </div>
          </div>

          {/* 批量操作栏 */}
          {selectedItemIds.length > 0 && (
            <div className="vault-card p-3 mb-4 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="p-1 rounded hover:bg-vault-hover transition-colors"
                >
                  <CheckSquare size={16} className="text-vault-accent" />
                </button>
                <span className="text-sm text-vault-text-secondary">
                  已选择 <span className="font-medium text-vault-text">{selectedItemIds.length}</span> 个项目
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-vault-accent hover:text-vault-accent-hover transition-colors"
                >
                  取消选择
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                  className="vault-btn-secondary flex items-center gap-1 text-sm"
                >
                  <Move size={14} />
                  移动到
                </button>
                <button
                  onClick={handleBatchExport}
                  className="vault-btn-secondary flex items-center gap-1 text-sm"
                >
                  <Download size={14} />
                  导出
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="vault-btn-secondary flex items-center gap-1 text-sm text-vault-warn hover:text-vault-warn/80"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>

              {/* 移动到文件夹下拉菜单 */}
              {showMoveDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoveDropdown(false)} />
                  <div className="absolute right-4 top-full mt-1 z-20 w-48 bg-vault-surface border border-vault-border rounded-lg shadow-lg py-1">
                    <button
                      key="none"
                      className="w-full text-left px-3 py-2 text-sm text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                      onClick={() => handleBatchMove('')}
                    >
                      无文件夹
                    </button>
                    {currentVaultFolders.map((folder) => (
                      <button
                        key={folder.id}
                        className="w-full text-left px-3 py-2 text-sm text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                        onClick={() => handleBatchMove(folder.id)}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 保险库选择器 */}
          <div className="relative mb-4">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border text-sm hover:border-vault-accent/30 transition-colors"
              onClick={() => setShowVaultDropdown(!showVaultDropdown)}
            >
              {/* 当前保险库颜色点 */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentVault?.color || '#6B7280' }}
              />
              <span className="text-vault-text">{currentVault?.name || '选择保险库'}</span>
              <ChevronDown size={14} className="text-vault-text-muted" />
            </button>

            {showVaultDropdown && (
              <>
                {/* 点击外部关闭 */}
                <div className="fixed inset-0 z-10" onClick={() => setShowVaultDropdown(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-56 bg-vault-surface border border-vault-border rounded-lg shadow-lg py-1">
                  {vaults.map((vault) => {
                    // 计算该保险库的实际条目数
                    const vaultItemCount = items.filter((i) => i.vaultId === vault.id).length;
                    return (
                      <button
                        key={vault.id}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                          currentVaultId === vault.id
                            ? 'bg-vault-accent/10 text-vault-accent'
                            : 'text-vault-text hover:bg-vault-hover',
                        )}
                        onClick={() => handleVaultChange(vault.id)}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: vault.color }}
                        />
                        <span className="flex-1 text-left">{vault.name}</span>
                        <span className="text-xs text-vault-text-muted">{vaultItemCount}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 文件夹筛选器 */}
          {currentVaultFolders.length > 0 && (
            <div className="relative mb-4">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vault-surface border border-vault-border text-sm hover:border-vault-accent/30 transition-colors"
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              >
                <FolderOpen size={14} className="text-vault-accent" />
                <span className="text-vault-text">
                  {selectedFolderId
                    ? currentVaultFolders.find((f) => f.id === selectedFolderId)?.name || '选择文件夹'
                    : '全部文件夹'}
                </span>
                {selectedFolderId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderId(null);
                    }}
                    className="ml-2 text-vault-text-muted hover:text-vault-text"
                  >
                    <ChevronUp size={12} />
                  </button>
                )}
                <ChevronDown size={14} className="text-vault-text-muted" />
              </button>

              {showFolderDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFolderDropdown(false)} />
                  <div className="absolute left-0 top-full mt-1 z-20 w-56 bg-vault-surface border border-vault-border rounded-lg shadow-lg py-1">
                    <button
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                        !selectedFolderId
                          ? 'bg-vault-accent/10 text-vault-accent'
                          : 'text-vault-text hover:bg-vault-hover',
                      )}
                      onClick={() => {
                        setSelectedFolderId(null);
                        setShowFolderDropdown(false);
                      }}
                    >
                      <FolderOpen size={14} />
                      <span>全部文件夹</span>
                    </button>
                    {currentVaultFolders.map((folder) => (
                      <button
                        key={folder.id}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                          selectedFolderId === folder.id
                            ? 'bg-vault-accent/10 text-vault-accent'
                            : 'text-vault-text hover:bg-vault-hover',
                        )}
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setShowFolderDropdown(false);
                        }}
                      >
                        <FolderOpen size={14} />
                        <span className="flex-1 text-left">{folder.name}</span>
                        <span className="text-xs text-vault-text-muted">{folder.itemCount}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 条目列表 */}
          {isLoading ? (
            renderSkeleton()
          ) : filteredItems.length === 0 ? (
            renderEmpty()
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => renderListItem(item, index))}
            </div>
          )}
        </div>

        {/* 标签侧边栏 */}
        {allTags.length > 0 && (
          <div className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-0">
              <h3 className="text-xs font-medium text-vault-text-muted uppercase tracking-wider mb-3">
                标签
              </h3>
              <div className="space-y-0.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors truncate',
                      tagFilter === tag
                        ? 'bg-vault-accent/15 text-vault-accent font-medium'
                        : 'text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text',
                    )}
                    onClick={() => handleTagFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {isContextMenuOpen && contextMenuSelectedItem && (
        <ContextMenu
          position={contextMenuPosition}
          items={contextMenuItems}
          onClose={closeContextMenu}
        />
      )}
    </AppLayout>
  );
}
