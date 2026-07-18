import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Paperclip,
  Star,
  Copy,
  Fingerprint,
  Smartphone,
  Shield,
  Building2,
  Database,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import type { VaultItem, ItemType } from '@/types';
import CopyButton from './CopyButton';
import { cn } from '@/lib/utils';
import { useItems } from '@/store';
import { secureCopy } from '@/utils/clipboard';

interface ItemCardProps {
  item: VaultItem;
  onContextMenu?: (e: React.MouseEvent | React.TouchEvent) => void;
}

// 根据项目类型获取图标
function getItemIcon(type: ItemType) {
  const iconMap: Record<ItemType, React.ReactNode> = {
    login: <KeyRound size={18} />,
    credit_card: <CreditCard size={18} />,
    identity: <User size={18} />,
    note: <FileText size={18} />,
    ssh_key: <Terminal size={18} />,
    document: <Paperclip size={18} />,
    passkey: <Fingerprint size={18} />,
    totp_authenticator: <Smartphone size={18} />,
    license: <Shield size={18} />,
    id_card: <Building2 size={18} />,
    database: <Database size={18} />,
    api_key: <KeyRound size={18} />,
  };
  return iconMap[type];
}

// 根据项目类型获取图标背景颜色
function getIconBg(type: ItemType): string {
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

function ItemCardComponent({ item, onContextMenu }: ItemCardProps) {
  const navigate = useNavigate();
  const { selectedItemIds, toggleSelect, deleteItem, incrementUsage } = useItems();
  const isSelected = selectedItemIds.includes(item.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除项目 "${item.title}" 吗？`)) {
      deleteItem(item.id);
    }
  };

  // 获取副标题
  const getSubtitle = (): string => {
    if (item.username) return item.username;
    if (item.cardNumber) return item.cardNumber;
    if (item.email) return item.email;
    if (item.website) return item.website;
    if (item.totpConfig?.issuer) return item.totpConfig.issuer;
    if (item.subtitle) return item.subtitle;
    return '';
  };
  const subtitle = getSubtitle();

  const handleClick = () => {
    navigate(`/items/detail/${item.id}`);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(item.id);
  };

  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onContextMenu) return;
    const timer = setTimeout(() => {
      setIsLongPress(true);
      onContextMenu(e);
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

  const handleTouchCancel = () => {
    handleTouchEnd();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!onContextMenu) return;
    e.preventDefault();
    onContextMenu(e);
  };

  return (
    <div
      className={cn(
        'vault-card p-4 cursor-pointer group relative',
        isSelected && 'ring-2 ring-vault-accent bg-vault-accent/5'
      )}
      onClick={() => {
        if (!isLongPress) handleClick();
      }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="flex items-start gap-3">
        {/* 选择框 */}
        <button
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
            isSelected
              ? 'bg-vault-accent border-vault-accent'
              : 'border-vault-border hover:border-vault-accent/50'
          )}
          onClick={handleSelect}
        >
          {isSelected && <CheckSquare size={12} className="text-white" />}
          {!isSelected && <Square size={12} className="text-transparent" />}
        </button>

        {/* 项目图标 */}
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', getIconBg(item.type))}>
          {getItemIcon(item.type)}
        </div>

        {/* 项目信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-vault-text truncate">
              {item.title}
            </h3>
            {/* 收藏图标 */}
            {item.favorite && (
              <Star size={14} className="text-vault-orange fill-vault-orange shrink-0" />
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-vault-text-secondary mt-0.5 truncate">
              {subtitle}
            </p>
          )}
          {/* 标签 */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span key={tag} className="vault-badge bg-vault-hover text-vault-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 悬停时显示快捷操作 */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.username && (
          <CopyButton value={item.username} itemId={item.id} />
        )}
        {item.password && (
          <button
            className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
            title="复制密码"
            onClick={async (e) => {
              e.stopPropagation();
              if (item.password) {
                const success = await secureCopy(item.password);
                if (success) {
                  incrementUsage(item.id);
                }
              }
            }}
          >
            <Copy size={14} />
          </button>
        )}
        <button
          className="p-1 rounded text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
          title="删除项目"
          onClick={handleDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const ItemCard = memo(ItemCardComponent);
export default ItemCard;
