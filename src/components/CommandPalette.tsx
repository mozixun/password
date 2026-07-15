import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Smartphone,
  Wand2,
  ShieldCheck,
  FolderOpen,
  Settings,
  Trash2,
  Star,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { VaultItem } from '@/types';

interface CommandResult {
  id: string;
  type: 'item' | 'page' | 'action';
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

const itemTypeIcons: Record<string, React.ReactNode> = {
  login: <KeyRound size={16} />,
  credit_card: <CreditCard size={16} />,
  identity: <User size={16} />,
  note: <FileText size={16} />,
  ssh_key: <Terminal size={16} />,
  totp_authenticator: <Smartphone size={16} />,
  passkey: <KeyRound size={16} />,
  document: <FileText size={16} />,
  license: <FileText size={16} />,
  id_card: <CreditCard size={16} />,
  database: <Terminal size={16} />,
  api_key: <KeyRound size={16} />,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { items, vaults } = useStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 重置选中索引当查询变化
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const pageCommands: CommandResult[] = useMemo(
    () => [
      {
        id: 'page-all-items',
        type: 'page',
        label: '所有项目',
        description: '查看全部密码条目',
        icon: <LayoutGrid size={16} />,
        action: () => navigate('/items'),
      },
      {
        id: 'page-generator',
        type: 'page',
        label: '密码生成器',
        description: '生成强密码',
        icon: <Wand2 size={16} />,
        action: () => navigate('/generator'),
      },
      {
        id: 'page-authenticator',
        type: 'page',
        label: '验证器',
        description: 'TOTP 两步验证',
        icon: <Smartphone size={16} />,
        action: () => navigate('/authenticator'),
      },
      {
        id: 'page-watchtower',
        type: 'page',
        label: '安全中心',
        description: '密码健康检查',
        icon: <ShieldCheck size={16} />,
        action: () => navigate('/watchtower'),
      },
      {
        id: 'page-vaults',
        type: 'page',
        label: '保管库',
        description: '管理保险库',
        icon: <FolderOpen size={16} />,
        action: () => navigate('/vaults'),
      },
      {
        id: 'page-favorites',
        type: 'page',
        label: '收藏夹',
        description: '收藏的项目',
        icon: <Star size={16} />,
        action: () => navigate('/items?favorite=true'),
      },
      {
        id: 'page-trash',
        type: 'page',
        label: '回收站',
        description: '已删除的项目',
        icon: <Trash2 size={16} />,
        action: () => navigate('/trash'),
      },
      {
        id: 'page-settings',
        type: 'page',
        label: '设置',
        description: '应用设置',
        icon: <Settings size={16} />,
        action: () => navigate('/settings'),
      },
    ],
    [navigate],
  );

  const actionCommands: CommandResult[] = useMemo(
    () => [
      {
        id: 'action-new-item',
        type: 'action',
        label: '新建条目',
        description: '创建新的密码条目',
        icon: <Plus size={16} />,
        action: () => navigate('/items/new'),
      },
    ],
    [navigate],
  );

  // 搜索条目
  const itemCommands: CommandResult[] = useMemo(() => {
    const activeItems = items.list.filter((i) => !i.trashedAt);
    return activeItems
      .filter((i) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          i.username?.toLowerCase().includes(q) ||
          i.url?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 8)
      .map((item: VaultItem) => ({
        id: `item-${item.id}`,
        type: 'item' as const,
        label: item.title,
        description: [item.username, item.url].filter(Boolean).join(' · '),
        icon: itemTypeIcons[item.type] || <KeyRound size={16} />,
        action: () => navigate(`/items/detail/${item.id}`),
      }));
  }, [items.list, query, navigate]);

  // 合并所有结果
  const allResults = useMemo(() => {
    const results: CommandResult[] = [];
    if (!query) {
      // 无查询时显示快捷操作和页面
      results.push(...actionCommands);
      results.push(...pageCommands);
    } else {
      // 有查询时优先显示匹配的条目，然后是页面
      if (itemCommands.length > 0) {
        results.push(...itemCommands);
      }
      const matchedPages = pageCommands.filter((p) =>
        p.label.toLowerCase().includes(query.toLowerCase()),
      );
      results.push(...matchedPages);
    }
    return results;
  }, [query, actionCommands, pageCommands, itemCommands]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allResults[activeIndex];
      if (selected) {
        selected.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // 滚动到选中项
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const activeEl = list.children[activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative w-full max-w-xl bg-vault-surface border border-vault-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-vault-border">
          <Search size={18} className="text-vault-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索条目、跳转页面或执行操作..."
            className="flex-1 bg-transparent outline-none text-sm text-vault-text placeholder:text-vault-text-muted"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-xs text-vault-text-muted bg-vault-hover rounded">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {allResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-vault-text-muted">
              未找到匹配结果
            </div>
          ) : (
            allResults.map((result, index) => (
              <button
                key={result.id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  result.action();
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  index === activeIndex
                    ? 'bg-vault-accent/10'
                    : 'hover:bg-vault-hover/50',
                )}
              >
                <span
                  className={cn(
                    'shrink-0',
                    index === activeIndex
                      ? 'text-vault-accent'
                      : 'text-vault-text-muted',
                  )}
                >
                  {result.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-vault-text truncate">
                    {result.label}
                  </div>
                  {result.description && (
                    <div className="text-xs text-vault-text-muted truncate">
                      {result.description}
                    </div>
                  )}
                </div>
                {result.type === 'item' && (
                  <span className="text-xs text-vault-text-muted bg-vault-hover px-1.5 py-0.5 rounded">
                    条目
                  </span>
                )}
                {index === activeIndex && (
                  <ArrowRight size={14} className="text-vault-text-muted shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-vault-border text-xs text-vault-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-vault-hover rounded">↑↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-vault-hover rounded">↵</kbd>
              选择
            </span>
          </div>
          <span>VaultKey 命令面板</span>
        </div>
      </div>
    </div>
  );
}
