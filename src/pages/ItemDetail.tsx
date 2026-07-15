// VaultKey 密码管理器 - 条目详情/编辑页面
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  StarOff,
  Pencil,
  Trash2,
  Share2,
  Save,
  X,
  ExternalLink,
  RefreshCw,
  CreditCard,
  User,
  FileText,
  Key,
  File,
  Shield,
  Globe,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  Hash,
  Check,
  Fingerprint,
  Smartphone,
  Building2,
  Database,
  Upload,
  Copy,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import PasswordDisplay from '@/components/PasswordDisplay';
import CopyButton from '@/components/CopyButton';
import { useItems, useVaults, useGenerator, useProfile } from '@/store';
import type { VaultItem, ItemType, PasswordHistoryEntry, Attachment, TOTPConfig, CustomField } from '@/types';
import { cn } from '@/lib/utils';
import { createPasskey, isPasskeySupported } from '@/utils/passkey';
import { generateTOTP as generateRealTOTP, getRemainingSeconds } from '@/utils/totp';

// ==================== 类型图标映射 ====================

/** 获取条目类型对应的图标和颜色 */
function getTypeIcon(type: ItemType) {
  const map: Record<ItemType, { icon: React.ReactNode; color: string; label: string }> = {
    login: { icon: <Globe size={20} />, color: 'text-vault-accent', label: '登录' },
    credit_card: { icon: <CreditCard size={20} />, color: 'text-vault-orange', label: '信用卡' },
    identity: { icon: <User size={20} />, color: 'text-vault-blue', label: '身份' },
    note: { icon: <FileText size={20} />, color: 'text-vault-purple', label: '安全笔记' },
    ssh_key: { icon: <Key size={20} />, color: 'text-vault-warn', label: 'SSH 密钥' },
    document: { icon: <File size={20} />, color: 'text-vault-text-secondary', label: '文档' },
    passkey: { icon: <Fingerprint size={20} />, color: 'text-vault-accent', label: '通行密钥' },
    totp_authenticator: { icon: <Smartphone size={20} />, color: 'text-vault-purple', label: '验证器' },
    license: { icon: <Shield size={20} />, color: 'text-vault-accent', label: 'License' },
    id_card: { icon: <Building2 size={20} />, color: 'text-vault-blue', label: '身份证' },
    database: { icon: <Database size={20} />, color: 'text-vault-purple', label: '数据库' },
    api_key: { icon: <Key size={20} />, color: 'text-vault-orange', label: 'API Key' },
  };
  return map[type];
}

/** 获取信用卡类型图标 */
function getCardTypeIcon(cardType?: string) {
  switch (cardType) {
    case 'visa':
      return { label: 'Visa', color: 'bg-blue-600' };
    case 'mastercard':
      return { label: 'MC', color: 'bg-red-500' };
    case 'amex':
      return { label: 'Amex', color: 'bg-blue-800' };
    case 'discover':
      return { label: 'Disc', color: 'bg-orange-500' };
    default:
      return { label: 'Card', color: 'bg-vault-border' };
  }
}

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 格式化日期 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ==================== TOTP 生成 ====================

// ==================== 新建条目类型选择卡片 ====================

const ITEM_TYPES: { type: ItemType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { type: 'login', icon: <Globe size={24} />, label: '登录', desc: '网站和应用密码', color: 'text-vault-accent border-vault-accent/30 hover:bg-vault-accent/10' },
  { type: 'credit_card', icon: <CreditCard size={24} />, label: '信用卡', desc: '银行卡信息', color: 'text-vault-orange border-vault-orange/30 hover:bg-vault-orange/10' },
  { type: 'identity', icon: <User size={24} />, label: '身份', desc: '个人信息和地址', color: 'text-vault-blue border-vault-blue/30 hover:bg-vault-blue/10' },
  { type: 'note', icon: <FileText size={24} />, label: '安全笔记', desc: '加密文本内容', color: 'text-vault-purple border-vault-purple/30 hover:bg-vault-purple/10' },
  { type: 'ssh_key', icon: <Key size={24} />, label: 'SSH 密钥', desc: '服务器连接密钥', color: 'text-vault-warn border-vault-warn/30 hover:bg-vault-warn/10' },
  { type: 'document', icon: <File size={24} />, label: '文档', desc: '文件和附件', color: 'text-vault-text-secondary border-vault-text-secondary/30 hover:bg-vault-text-secondary/10' },
  { type: 'passkey', icon: <Fingerprint size={24} />, label: '通行密钥', desc: 'FIDO2 无密码登录', color: 'text-vault-accent border-vault-accent/30 hover:bg-vault-accent/10' },
  { type: 'totp_authenticator', icon: <Smartphone size={24} />, label: '验证器', desc: 'TOTP 两步验证', color: 'text-vault-purple border-vault-purple/30 hover:bg-vault-purple/10' },
  { type: 'license', icon: <Shield size={24} />, label: 'License', desc: '软件许可证和序列号', color: 'text-vault-accent border-vault-accent/30 hover:bg-vault-accent/10' },
  { type: 'id_card', icon: <Building2 size={24} />, label: '身份证', desc: '身份证件信息', color: 'text-vault-blue border-vault-blue/30 hover:bg-vault-blue/10' },
  { type: 'database', icon: <Database size={24} />, label: '数据库', desc: '数据库连接配置', color: 'text-vault-purple border-vault-purple/30 hover:bg-vault-purple/10' },
  { type: 'api_key', icon: <Key size={24} />, label: 'API Key', desc: '开发密钥和令牌', color: 'text-vault-orange border-vault-orange/30 hover:bg-vault-orange/10' },
];

// ==================== 标签颜色映射 ====================

const TAG_COLORS = [
  'bg-vault-accent/20 text-vault-accent',
  'bg-vault-blue/20 text-vault-blue',
  'bg-vault-purple/20 text-vault-purple',
  'bg-vault-orange/20 text-vault-orange',
  'bg-vault-warn/20 text-vault-warn',
  'bg-emerald-500/20 text-emerald-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-pink-500/20 text-pink-400',
];

/** 获取标签颜色类名 */
function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

// ==================== 字段行组件 ====================

/** 详情字段行 - 查看模式 */
function DetailField({
  label,
  children,
  copyValue,
}: {
  label: string;
  children: React.ReactNode;
  copyValue?: string;
}) {
  return (
    <div className="py-3 border-b border-vault-border/50 last:border-b-0">
      <div className="text-xs text-vault-text-muted mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 text-sm text-vault-text">{children}</div>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}

/** 编辑字段行 - 编辑模式 */
function EditField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  monospace = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  monospace?: boolean;
}) {
  return (
    <div className="py-3 border-b border-vault-border/50 last:border-b-0">
      <div className="text-xs text-vault-text-muted mb-1.5">{label}</div>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full vault-input text-sm min-h-[80px] resize-y',
            monospace && 'font-mono',
          )}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('w-full vault-input text-sm', monospace && 'font-mono')}
        />
      )}
    </div>
  );
}

// ==================== TOTP 倒计时组件 ====================

function TOTPDisplay({ secret }: { secret: string }) {
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refreshCode = useCallback(async () => {
    try {
      const newCode = await generateRealTOTP({
        secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        issuer: '',
        account: '',
      });
      setCode(newCode);
    } catch {
      setCode('----');
    }
  }, [secret]);

  useEffect(() => {
    refreshCode();
    setRemaining(getRemainingSeconds(30));

    intervalRef.current = setInterval(() => {
      const newRemaining = getRemainingSeconds(30);

      setRemaining((prev) => {
        if (prev <= 1 && newRemaining >= 29) {
          refreshCode();
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 500);
        }
        return newRemaining;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [secret, refreshCode]);

  const handleRefresh = useCallback(() => {
    refreshCode();
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, [refreshCode]);

  // 倒计时圆环参数
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - remaining / 30);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-vault-border/50">
      <div className="text-xs text-vault-text-muted mb-1 w-full">验证码 (TOTP)</div>
      <div className="flex items-center gap-3 mt-1">
        {/* 6位验证码 */}
        <span
          className={cn(
            'text-2xl font-mono font-bold tracking-[0.3em] text-vault-accent',
            refreshing && 'totp-refreshing',
          )}
        >
          {code.slice(0, 3)} {code.slice(3)}
        </span>

        {/* 倒计时圆环 */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-vault-border"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                'transition-all duration-1000',
                remaining <= 5 ? 'text-vault-warn' : 'text-vault-accent',
              )}
            />
          </svg>
          <span
            className={cn(
              'absolute text-[10px] font-bold',
              remaining <= 5 ? 'text-vault-warn' : 'text-vault-text-secondary',
            )}
          >
            {remaining}
          </span>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
          title="刷新验证码"
        >
          <RefreshCw size={16} />
        </button>

        {/* 复制按钮 */}
        <CopyButton value={code} />
      </div>
    </div>
  );
}

// ==================== 密码历史组件 ====================

function PasswordHistory({ history, itemId, onRollbackSuccess }: { history: PasswordHistoryEntry[]; itemId: string; onRollbackSuccess?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rollbackIndex, setRollbackIndex] = useState<number | null>(null);
  const items = useItems();

  if (!history || history.length === 0) return null;

  const handleCopy = async (password: string, index: number) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // 静默处理复制失败
    }
  };

  const handleRollback = async (password: string, index: number) => {
    if (!confirm('确定要将密码回滚到此版本吗？当前密码将被添加到历史记录中。')) {
      return;
    }

    setRollbackIndex(index);
    items.rollbackPassword(itemId, password);

    setTimeout(() => {
      setRollbackIndex(null);
      onRollbackSuccess?.();
    }, 500);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-vault-text-secondary hover:text-vault-text transition-colors"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>密码历史 ({history.length})</span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 pl-6">
          {history.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-vault-hover/50 transition-colors"
            >
              <span className="text-xs text-vault-text-muted w-24 shrink-0">
                {formatDate(entry.changedAt)}
              </span>
              <PasswordDisplay password={entry.password} />
              <button
                onClick={() => handleCopy(entry.password, index)}
                className={cn(
                  'p-1 rounded-md text-vault-text-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors',
                  copiedIndex === index && 'text-vault-success'
                )}
                title="复制密码"
              >
                {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <button
                onClick={() => handleRollback(entry.password, index)}
                className={cn(
                  'vault-btn-secondary text-xs py-1 px-2 flex items-center gap-1',
                  rollbackIndex === index && 'text-vault-success'
                )}
                title="使用此密码"
              >
                {rollbackIndex === index ? <Check size={12} /> : <RefreshCw size={12} />}
                {rollbackIndex === index ? '已使用' : '使用'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 内联密码生成器 ====================

function InlinePasswordGenerator({
  onSelect,
  onCancel,
}: {
  onSelect: (password: string) => void;
  onCancel: () => void;
}) {
  const generator = useGenerator();

  useEffect(() => {
    generator.generatePassword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="vault-card p-4 mt-2 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-vault-text">密码生成器</span>
        <button
          onClick={onCancel}
          className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* 生成的密码预览 */}
      <div className="bg-vault-surface rounded-lg p-3 font-mono text-sm break-all text-vault-accent">
        {generator.generatedPassword}
      </div>

      {/* 长度滑块 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-vault-text-muted w-8">长度</span>
        <input
          type="range"
          min={8}
          max={64}
          value={generator.length}
          onChange={(e) => {
            generator.setLength(Number(e.target.value));
            generator.generatePassword();
          }}
          className="flex-1 accent-vault-accent"
        />
        <span className="text-xs text-vault-text w-6 text-right">{generator.length}</span>
      </div>

      {/* 选项开关 */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { label: '大写字母 (A-Z)', key: 'uppercase' as const },
          { label: '小写字母 (a-z)', key: 'lowercase' as const },
          { label: '数字 (0-9)', key: 'digits' as const },
          { label: '符号 (!@#$)', key: 'symbols' as const },
        ] as const).map(({ label, key }) => (
          <label key={key} className="flex items-center gap-2 text-xs text-vault-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={generator[key]}
              onChange={(e) => {
                if (key === 'uppercase') generator.setUppercase(e.target.checked);
                else if (key === 'lowercase') generator.setLowercase(e.target.checked);
                else if (key === 'digits') generator.setDigits(e.target.checked);
                else if (key === 'symbols') generator.setSymbols(e.target.checked);
                generator.generatePassword();
              }}
              className="accent-vault-accent"
            />
            {label}
          </label>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => generator.generatePassword()}
          className="vault-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
        >
          <RefreshCw size={12} />
          重新生成
        </button>
        <button
          onClick={() => onSelect(generator.generatedPassword)}
          className="vault-btn-primary text-xs py-1.5 px-3"
        >
          使用此密码
        </button>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

export default function ItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const items = useItems();
  const incrementUsage = items.incrementUsage;
  const vaults = useVaults();
  const profile = useProfile();

  const isNew = id === 'new' || location.pathname === '/items/new';

  // 找到当前条目
  const existingItem = isNew ? null : items.list.find((item) => item.id === id);

  // 记录已增加使用统计的条目 ID，避免重复调用
  const incrementedItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (existingItem && incrementedItemIdRef.current !== existingItem.id) {
      incrementUsage(existingItem.id);
      incrementedItemIdRef.current = existingItem.id;
    }
  }, [existingItem, incrementUsage]);

  // 编辑状态（新建模式默认进入编辑状态）
  const [isEditing, setIsEditing] = useState(isNew);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [showGenerator, setShowGenerator] = useState(false);
  const [rollbackSuccess, setRollbackSuccess] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState('');

  // 新建模式：选中的类型
  const [selectedType, setSelectedType] = useState<ItemType>('login');

  // 编辑表单数据
  const [formData, setFormData] = useState<Partial<VaultItem>>({});

  // 密码显示/隐藏状态（用于信用卡CVV和SSH私钥）
  const [showCVV, setShowCVV] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // 笔记展开状态
  const [notesExpanded, setNotesExpanded] = useState(false);

  // 标签编辑
  const [tagInput, setTagInput] = useState('');

  // 自动保存指示器
  const [autoSaveVisible, setAutoSaveVisible] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (isNew) {
      setFormData({
        type: 'login',
        title: '',
        vaultId: vaults.currentVaultId,
        favorite: false,
        tags: [],
        notes: '',
      });
      setSelectedType('login');
    } else if (existingItem) {
      setFormData({ ...existingItem });
    }
  }, [isNew, existingItem, vaults.currentVaultId]);

  // 更新表单字段的工具函数
  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 自定义字段管理
  const handleAddCustomField = useCallback(() => {
    const newField: CustomField = {
      id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: '',
      type: 'text',
      value: '',
    };
    updateField('customFields', [...(formData.customFields || []), newField]);
  }, [formData.customFields, updateField]);

  const handleUpdateCustomField = useCallback((id: string, updates: Partial<CustomField>) => {
    updateField(
      'customFields',
      (formData.customFields || []).map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  }, [formData.customFields, updateField]);

  const handleRemoveCustomField = useCallback((id: string) => {
    updateField(
      'customFields',
      (formData.customFields || []).filter((f) => f.id !== id),
    );
  }, [formData.customFields, updateField]);

  // 保存操作
  const handleSave = useCallback(() => {
    if (!formData.title?.trim()) {
      alert('请输入标题');
      return;
    }
    if (isNew) {
      // 新建条目
      items.addItem({
        vaultId: formData.vaultId || vaults.currentVaultId,
        type: formData.type || selectedType,
        title: formData.title || '未命名',
        favorite: formData.favorite || false,
        tags: formData.tags || [],
        ...getTypeSpecificFields(formData),
      } as Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>);
      navigate('/items');
    } else if (existingItem) {
      // 更新条目
      items.updateItem(existingItem.id, {
        title: formData.title,
        tags: formData.tags,
        notes: formData.notes,
        customFields: formData.customFields,
        ...getTypeSpecificFields(formData),
      });
      setIsEditing(false);
    }
    // 显示自动保存指示器
    setAutoSaveVisible(true);
    setTimeout(() => setAutoSaveVisible(false), 2000);
  }, [isNew, existingItem, formData, items, navigate, selectedType, vaults.currentVaultId]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    if (isNew) {
      navigate('/items');
    } else if (existingItem) {
      setFormData({ ...existingItem });
      setIsEditing(false);
    }
    setShowGenerator(false);
  }, [isNew, existingItem, navigate]);

  // 删除条目（移至回收站）
  const handleDelete = useCallback(() => {
    if (existingItem) {
      if (window.confirm(`确定要将 "${existingItem.title}" 移至回收站吗？`)) {
        items.deleteItem(existingItem.id);
        navigate('/items');
      }
    }
  }, [existingItem, items, navigate]);

  // 切换收藏
  const handleToggleFavorite = useCallback(() => {
    if (existingItem) {
      items.toggleFavorite(existingItem.id);
      setFormData((prev) => ({ ...prev, favorite: !prev.favorite }));
    }
  }, [existingItem, items]);

  // 添加标签
  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      updateField('tags', [...(formData.tags || []), tag]);
      setTagInput('');
    }
  }, [tagInput, formData.tags, updateField]);

  // 移除标签
  const handleRemoveTag = useCallback(
    (tag: string) => {
      updateField('tags', formData.tags?.filter((t) => t !== tag) || []);
    },
    [formData.tags, updateField],
  );

  // 获取类型特定字段（清理非当前类型字段）
  function getTypeSpecificFields(data: Partial<VaultItem>): Partial<VaultItem> {
    const base = { ...data };
    // 只保留对应类型的字段
    return base;
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleDownload = (attachment: Attachment) => {
    const binaryContent = atob(attachment.content);
    const byteArray = new Uint8Array(binaryContent.length);
    for (let i = 0; i < binaryContent.length; i++) {
      byteArray[i] = binaryContent.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: attachment.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name || 'download';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`文件 ${file.name} 超过大小限制（最大10MB）`);
        continue;
      }

      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Content = (event.target?.result as string).split(',')[1];
          const newAttachment: Omit<Attachment, 'id' | 'createdAt'> = {
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            content: base64Content || '',
          };

          if (isNew) {
            updateField('attachments', [...(formData.attachments || []), { ...newAttachment, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() }]);
          } else if (existingItem) {
            items.addAttachment(existingItem.id, newAttachment);
            setFormData((prev) => ({
              ...prev,
              attachments: [...(prev.attachments || []), { ...newAttachment, id: `att-${Date.now()}`, createdAt: new Date().toISOString() }],
            }));
          }
        };
        reader.readAsDataURL(file);
      } catch {
        alert('文件读取失败，请重试');
      }
    }

    e.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!confirm('确定要删除这个附件吗？')) return;

    if (isNew) {
      updateField('attachments', (formData.attachments || []).filter((a) => a.id !== attachmentId));
    } else if (existingItem) {
      items.removeAttachment(existingItem.id, attachmentId);
      setFormData((prev) => ({
        ...prev,
        attachments: (prev.attachments || []).filter((a) => a.id !== attachmentId),
      }));
    }
  };

  // 加载中或未找到
  if (!isNew && !existingItem) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-vault-text-muted">条目未找到</div>
        </div>
      </AppLayout>
    );
  }

  const currentItem = isNew ? formData : existingItem;
  const itemType = (isNew ? selectedType : currentItem?.type) as ItemType;
  const typeInfo = getTypeIcon(itemType);
  const vaultName = vaults.list.find((v) => v.id === currentItem?.vaultId)?.name || '';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* ==================== 头部区域 ==================== */}
        <div className="flex items-start gap-4 mb-6">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/items')}
            className="mt-1 p-2 rounded-lg text-vault-text-secondary hover:text-vault-text hover:bg-vault-hover transition-colors shrink-0"
            title="返回列表"
          >
            <ArrowLeft size={20} />
          </button>

          {/* 标题和操作区 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* 类型图标 */}
              <div className={cn('p-2 rounded-lg bg-vault-surface', typeInfo.color)}>
                {typeInfo.icon}
              </div>

              {/* 标题 */}
              {isEditing || isNew ? (
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="输入标题..."
                  className="flex-1 bg-transparent text-xl font-semibold text-vault-text border-b border-vault-border focus:border-vault-accent focus:outline-none pb-1 transition-colors"
                />
              ) : (
                <h1 className="text-xl font-semibold text-vault-text truncate">
                  {currentItem?.title}
                </h1>
              )}

              {/* 收藏按钮 */}
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'p-1.5 rounded-lg transition-colors shrink-0',
                  currentItem?.favorite
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-vault-text-muted hover:text-yellow-400',
                )}
                title={currentItem?.favorite ? '取消收藏' : '添加收藏'}
              >
                {currentItem?.favorite ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
              </button>
            </div>

            {/* 类型标签和操作按钮 */}
            <div className="flex items-center gap-2 mt-2">
              <span className="vault-badge bg-vault-surface text-vault-text-secondary text-[10px]">
                {typeInfo.label}
              </span>

              <div className="ml-auto flex items-center gap-1">
                {isEditing || isNew ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="vault-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Save size={14} />
                      保存
                    </button>
                    <button
                      onClick={handleCancel}
                      className="vault-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <X size={14} />
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="vault-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
                      title="移至回收站"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
                      title="分享"
                    >
                      <Share2 size={14} />
                    </button>
                  </>
                )}

                {/* 自动保存指示器 */}
                {autoSaveVisible && (
                  <span className="text-xs text-vault-accent flex items-center gap-1 ml-2 animate-fade-in">
                    <Check size={12} />
                    已保存
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 新建模式：类型选择器 ==================== */}
        {isNew && !isEditing && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-vault-text-secondary mb-3">选择类型</h3>
            <div className="grid grid-cols-3 gap-3">
              {ITEM_TYPES.map(({ type, icon, label, desc, color }) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    updateField('type', type);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                    selectedType === type
                      ? color + ' border-current bg-opacity-10'
                      : 'border-vault-border text-vault-text-muted hover:border-vault-text-secondary hover:text-vault-text-secondary',
                  )}
                >
                  {icon}
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 主内容区域 ==================== */}
        <div className="vault-card p-6 mb-4">
          {/* ---------- 登录类型 ---------- */}
          {itemType === 'login' && (
            <>
              {/* URL */}
              {isEditing ? (
                <EditField
                  label="网址"
                  value={formData.url || ''}
                  onChange={(val) => updateField('url', val)}
                  placeholder="https://example.com"
                />
              ) : (
                currentItem?.url && (
                  <DetailField label="网址">
                    <a
                      href={currentItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-vault-accent hover:underline"
                    >
                      {currentItem.url}
                      <ExternalLink size={12} />
                    </a>
                  </DetailField>
                )
              )}

              {/* 用户名 */}
              {isEditing ? (
                <EditField
                  label="用户名"
                  value={formData.username || ''}
                  onChange={(val) => updateField('username', val)}
                  placeholder="输入用户名"
                />
              ) : (
                currentItem?.username && (
                  <DetailField label="用户名" copyValue={currentItem.username}>
                    {currentItem.username}
                  </DetailField>
                )
              )}

              {/* 密码 */}
              {isEditing ? (
                <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                  <div className="text-xs text-vault-text-muted mb-1.5">密码</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.password || ''}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="输入密码"
                      className="flex-1 vault-input text-sm font-mono"
                    />
                    <button
                      onClick={() => setShowGenerator(!showGenerator)}
                      className="vault-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
                    >
                      <Hash size={12} />
                      生成
                    </button>
                  </div>
                  {showGenerator && (
                    <InlinePasswordGenerator
                      onSelect={(pwd) => {
                        updateField('password', pwd);
                        setShowGenerator(false);
                      }}
                      onCancel={() => setShowGenerator(false)}
                    />
                  )}
                </div>
              ) : (
                currentItem?.password && (
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="text-xs text-vault-text-muted mb-1">密码</div>
                    <PasswordDisplay password={currentItem.password} />
                  </div>
                )
              )}

              {/* TOTP 验证码 */}
              {currentItem?.totp && !isEditing && <TOTPDisplay secret={currentItem.totp} />}

              {/* TOTP 密钥输入（编辑模式） */}
              {isEditing && (
                <EditField
                  label="TOTP 密钥 (Base32)"
                  value={formData.totp || ''}
                  onChange={(val) => updateField('totp', val)}
                  placeholder="输入 Base32 编码的 TOTP 密钥"
                  monospace
                />
              )}

              {/* Passkey 创建（编辑模式） */}
              {isEditing && (
                <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                  <div className="text-xs text-vault-text-muted mb-1.5">通行证密钥</div>
                  <button
                    onClick={async () => {
                      const website = formData.url || '';
                      if (!website) {
                        alert('请先输入网站地址');
                        return;
                      }
                      const passkey = await createPasskey(website, website, profile.profile.email);
                      updateField('passkey', passkey);
                    }}
                    className="vault-btn-secondary w-full flex items-center justify-center gap-2"
                    disabled={!isPasskeySupported()}
                  >
                    <Fingerprint size={16} />
                    {isPasskeySupported() ? '创建通行证密钥' : '浏览器不支持 Passkey'}
                  </button>
                  {formData.passkey && (
                    <div className="mt-3 p-3 bg-vault-success/10 border border-vault-success/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-vault-success" />
                        <span className="text-sm text-vault-success">通行证密钥已创建</span>
                      </div>
                      <div className="mt-2 text-xs text-vault-text-muted">
                        设备类型: {formData.passkey.deviceType === 'multi_device' ? '跨设备同步' : '单设备'}
                        {formData.passkey.backedUp && ' · 已备份'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Passkey 信息（查看模式） */}
              {currentItem?.passkey && !isEditing && (
                <div className="py-3 border-b border-vault-border/50">
                  <div className="text-xs text-vault-text-muted mb-1">通行证密钥</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'vault-badge',
                      currentItem.passkey.deviceType === 'multi_device'
                        ? 'bg-vault-accent/20 text-vault-accent'
                        : 'bg-vault-orange/20 text-vault-orange'
                    )}>
                      {currentItem.passkey.deviceType === 'multi_device' ? '跨设备同步' : '单设备'}
                    </span>
                    {currentItem.passkey.backedUp && (
                      <span className="vault-badge bg-emerald-500/20 text-emerald-400">
                        已备份
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 笔记 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <button
                      onClick={() => setNotesExpanded(!notesExpanded)}
                      className="flex items-center gap-2 text-xs text-vault-text-muted hover:text-vault-text-secondary transition-colors mb-1"
                    >
                      {notesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      备注
                    </button>
                    {notesExpanded && (
                      <div className="text-sm text-vault-text-secondary mt-1 whitespace-pre-wrap">
                        {currentItem.notes}
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- 信用卡类型 ---------- */}
          {itemType === 'credit_card' && (
            <>
              {/* 卡类型图标 */}
              {!isEditing && currentItem?.cardType && (
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-vault-border/50">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-bold text-white',
                      getCardTypeIcon(currentItem.cardType).color,
                    )}
                  >
                    {getCardTypeIcon(currentItem.cardType).label}
                  </span>
                </div>
              )}

              {/* 持卡人姓名 */}
              {isEditing ? (
                <EditField
                  label="持卡人姓名"
                  value={formData.cardholderName || ''}
                  onChange={(val) => updateField('cardholderName', val)}
                  placeholder="输入持卡人姓名"
                />
              ) : (
                currentItem?.cardholderName && (
                  <DetailField label="持卡人姓名" copyValue={currentItem.cardholderName}>
                    {currentItem.cardholderName}
                  </DetailField>
                )
              )}

              {/* 卡号 */}
              {isEditing ? (
                <EditField
                  label="卡号"
                  value={formData.cardNumber || ''}
                  onChange={(val) => updateField('cardNumber', val)}
                  placeholder="输入卡号"
                  monospace
                />
              ) : (
                currentItem?.cardNumber && (
                  <DetailField label="卡号" copyValue={currentItem.cardNumber}>
                    <span className="font-mono tracking-wider">
                      {currentItem.cardNumber.includes('*')
                        ? currentItem.cardNumber
                        : `•••• •••• •••• ${currentItem.cardNumber.slice(-4)}`}
                    </span>
                  </DetailField>
                )
              )}

              {/* 有效期 */}
              {isEditing ? (
                <EditField
                  label="有效期"
                  value={formData.expiryDate || ''}
                  onChange={(val) => updateField('expiryDate', val)}
                  placeholder="MM/YY"
                />
              ) : (
                currentItem?.expiryDate && (
                  <DetailField label="有效期">
                    {currentItem.expiryDate}
                  </DetailField>
                )
              )}

              {/* CVV */}
              {isEditing ? (
                <EditField
                  label="CVV"
                  value={formData.cvv || ''}
                  onChange={(val) => updateField('cvv', val)}
                  placeholder="输入 CVV"
                  type="password"
                  monospace
                />
              ) : (
                currentItem?.cvv && (
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="text-xs text-vault-text-muted mb-1">CVV</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {showCVV ? currentItem.cvv : '•••'}
                      </span>
                      <button
                        onClick={() => setShowCVV(!showCVV)}
                        className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                        title={showCVV ? '隐藏' : '显示'}
                      >
                        <Shield size={14} />
                      </button>
                      {showCVV && <CopyButton value={currentItem.cvv} />}
                    </div>
                  </div>
                )
              )}

              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- 身份类型 ---------- */}
          {itemType === 'identity' && (
            <>
              {isEditing ? (
                <>
                  <EditField
                    label="全名"
                    value={formData.fullName || ''}
                    onChange={(val) => updateField('fullName', val)}
                    placeholder="输入全名"
                  />
                  <EditField
                    label="邮箱"
                    value={formData.email || ''}
                    onChange={(val) => updateField('email', val)}
                    placeholder="输入邮箱"
                  />
                  <EditField
                    label="电话"
                    value={formData.phone || ''}
                    onChange={(val) => updateField('phone', val)}
                    placeholder="输入电话号码"
                  />
                  <EditField
                    label="地址"
                    value={formData.address || ''}
                    onChange={(val) => updateField('address', val)}
                    type="textarea"
                    placeholder="输入地址"
                  />
                </>
              ) : (
                <>
                  {currentItem?.fullName && (
                    <DetailField label="全名" copyValue={currentItem.fullName}>
                      {currentItem.fullName}
                    </DetailField>
                  )}
                  {currentItem?.email && (
                    <DetailField label="邮箱" copyValue={currentItem.email}>
                      {currentItem.email}
                    </DetailField>
                  )}
                  {currentItem?.phone && (
                    <DetailField label="电话" copyValue={currentItem.phone}>
                      {currentItem.phone}
                    </DetailField>
                  )}
                  {currentItem?.address && (
                    <DetailField label="地址" copyValue={currentItem.address}>
                      {currentItem.address}
                    </DetailField>
                  )}
                </>
              )}
            </>
          )}

          {/* ---------- 安全笔记类型 ---------- */}
          {itemType === 'note' && (
            <>
              {isEditing ? (
                <EditField
                  label="内容"
                  value={formData.content || ''}
                  onChange={(val) => updateField('content', val)}
                  type="textarea"
                  placeholder="输入笔记内容..."
                  monospace
                />
              ) : (
                currentItem?.content && (
                  <div className="py-2">
                    <pre className="font-mono text-sm text-vault-text whitespace-pre-wrap leading-relaxed">
                      {currentItem.content}
                    </pre>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- SSH 密钥类型 ---------- */}
          {itemType === 'ssh_key' && (
            <>
              {/* 密钥类型徽章 */}
              {!isEditing && currentItem?.keyType && (
                <div className="mb-3">
                  <span className="vault-badge bg-vault-warn/20 text-vault-warn">
                    {currentItem.keyType.toUpperCase()}
                  </span>
                </div>
              )}
              {isEditing && (
                <EditField
                  label="密钥类型"
                  value={formData.keyType || ''}
                  onChange={(val) => updateField('keyType', val)}
                  placeholder="ed25519 / rsa"
                />
              )}

              {/* 公钥 */}
              {isEditing ? (
                <EditField
                  label="公钥"
                  value={formData.publicKey || ''}
                  onChange={(val) => updateField('publicKey', val)}
                  type="textarea"
                  placeholder="粘贴公钥..."
                  monospace
                />
              ) : (
                currentItem?.publicKey && (
                  <div className="py-3 border-b border-vault-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-vault-text-muted">公钥</span>
                      <CopyButton value={currentItem.publicKey} />
                    </div>
                    <div className="bg-vault-surface rounded-lg p-3">
                      <code className="text-xs font-mono text-vault-text-secondary break-all">
                        {currentItem.publicKey}
                      </code>
                    </div>
                  </div>
                )
              )}

              {/* 私钥 */}
              {isEditing ? (
                <EditField
                  label="私钥"
                  value={formData.privateKey || ''}
                  onChange={(val) => updateField('privateKey', val)}
                  type="textarea"
                  placeholder="粘贴私钥..."
                  monospace
                />
              ) : (
                currentItem?.privateKey && (
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-vault-text-muted">私钥</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                          title={showPrivateKey ? '隐藏私钥' : '显示私钥'}
                        >
                          <Shield size={14} />
                        </button>
                        {showPrivateKey && <CopyButton value={currentItem.privateKey} />}
                      </div>
                    </div>
                    <div className="bg-vault-surface rounded-lg p-3">
                      <code className="text-xs font-mono text-vault-text-secondary break-all">
                        {showPrivateKey ? currentItem.privateKey : '••••••••••••••••'}
                      </code>
                    </div>
                  </div>
                )
              )}

              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- 文档类型 ---------- */}
          {itemType === 'document' && (
            <>
              {isEditing ? (
                <>
                  <EditField
                    label="文件名"
                    value={formData.fileName || ''}
                    onChange={(val) => updateField('fileName', val)}
                    placeholder="文件名"
                  />
                  <EditField
                    label="备注"
                    value={formData.notes || ''}
                    onChange={(val) => updateField('notes', val)}
                    type="textarea"
                    placeholder="添加备注..."
                  />
                </>
              ) : (
                <>
                  {currentItem?.fileName && (
                    <div className="py-3 border-b border-vault-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-vault-surface text-vault-text-secondary">
                          <File size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-vault-text font-medium truncate">
                            {currentItem.fileName}
                          </div>
                          {currentItem.fileSize && (
                            <div className="text-xs text-vault-text-muted">
                              {formatFileSize(currentItem.fileSize)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => currentItem?.attachments?.[0] && handleDownload(currentItem.attachments[0])}
                          className="vault-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
                          disabled={!currentItem?.attachments?.length}
                        >
                          <Download size={14} />
                          下载
                        </button>
                      </div>
                    </div>
                  )}
                  {currentItem?.notes && (
                    <div className="py-3">
                      <span className="text-xs text-vault-text-muted">备注</span>
                      <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ---------- 通行密钥 (Passkey) 类型 ---------- */}
          {itemType === 'passkey' && (
            <>
              {/* 网站 */}
              {isEditing ? (
                <EditField
                  label="网站"
                  value={formData.website || ''}
                  onChange={(val) => updateField('website', val)}
                  placeholder="example.com"
                />
              ) : (
                currentItem?.website && (
                  <DetailField label="网站">
                    <span className="font-mono">{currentItem.website}</span>
                  </DetailField>
                )
              )}

              {/* Passkey 创建按钮（编辑模式） */}
              {isEditing && (
                <div className="py-3">
                  <button
                    onClick={async () => {
                      const website = formData.website || '';
                      if (!website) {
                        alert('请先输入网站域名');
                        return;
                      }
                      const passkey = await createPasskey(website, website, profile.profile.email);
                      updateField('passkey', passkey);
                    }}
                    className="vault-btn-secondary w-full flex items-center justify-center gap-2"
                    disabled={!isPasskeySupported()}
                  >
                    <Fingerprint size={16} />
                    {isPasskeySupported() ? '创建通行密钥' : '浏览器不支持 Passkey'}
                  </button>
                  {formData.passkey && (
                    <div className="mt-3 p-3 bg-vault-success/10 border border-vault-success/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-vault-success" />
                        <span className="text-sm text-vault-success">通行密钥已创建</span>
                      </div>
                      <div className="mt-2 text-xs text-vault-text-muted">
                        设备类型: {formData.passkey.deviceType === 'multi_device' ? '跨设备同步' : '单设备'}
                        {formData.passkey.backedUp && ' · 已备份'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Passkey 信息 */}
              {currentItem?.passkey && !isEditing && (
                <>
                  {/* 设备类型 */}
                  <div className="py-3 border-b border-vault-border/50">
                    <div className="text-xs text-vault-text-muted mb-1">设备类型</div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'vault-badge',
                        currentItem.passkey.deviceType === 'multi_device'
                          ? 'bg-vault-accent/20 text-vault-accent'
                          : 'bg-vault-orange/20 text-vault-orange'
                      )}>
                        {currentItem.passkey.deviceType === 'multi_device' ? '跨设备同步' : '单设备'}
                      </span>
                      {currentItem.passkey.backedUp && (
                        <span className="vault-badge bg-emerald-500/20 text-emerald-400">
                          已备份
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 传输方式 */}
                  {currentItem.passkey.transports && currentItem.passkey.transports.length > 0 && (
                    <div className="py-3 border-b border-vault-border/50">
                      <div className="text-xs text-vault-text-muted mb-2">支持的传输方式</div>
                      <div className="flex flex-wrap gap-2">
                        {currentItem.passkey.transports.map((transport) => (
                          <span key={transport} className="vault-badge bg-vault-blue/20 text-vault-blue">
                            {transport === 'internal' && '设备内置'}
                            {transport === 'usb' && 'USB'}
                            {transport === 'nfc' && 'NFC'}
                            {transport === 'bluetooth' && '蓝牙'}
                            {transport === 'hybrid' && '混合'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 凭据 ID */}
                  <div className="py-3 border-b border-vault-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-vault-text-muted">凭据 ID</span>
                      <CopyButton value={currentItem.passkey.credentialId} />
                    </div>
                    <code className="text-xs font-mono text-vault-text-secondary break-all">
                      {currentItem.passkey.credentialId}
                    </code>
                  </div>

                  {/* 签名计数 */}
                  <div className="py-3 border-b border-vault-border/50">
                    <div className="text-xs text-vault-text-muted mb-1">签名计数</div>
                    <span className="text-sm text-vault-text font-mono">
                      {currentItem.passkey.signCount}
                    </span>
                  </div>

                  {/* 认证器 AAGUID */}
                  {currentItem.passkey.aaguid && (
                    <div className="py-3 border-b border-vault-border/50">
                      <div className="text-xs text-vault-text-muted mb-1">认证器 AAGUID</div>
                      <code className="text-xs font-mono text-vault-text-secondary">
                        {currentItem.passkey.aaguid}
                      </code>
                    </div>
                  )}

                  {/* 最后使用时间 */}
                  {currentItem.passkey.lastUsedAt && (
                    <div className="py-3 border-b border-vault-border/50">
                      <div className="text-xs text-vault-text-muted mb-1">最后使用</div>
                      <span className="text-sm text-vault-text">
                        {formatDate(currentItem.passkey.lastUsedAt)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- TOTP 验证器类型 ---------- */}
          {itemType === 'totp_authenticator' && (
            <>
              {currentItem?.totpConfig && !isEditing && (
                <>
                  {/* 服务提供商 */}
                  <DetailField label="服务提供商">
                    {currentItem.totpConfig.issuer || currentItem.title}
                  </DetailField>

                  {/* 账户 */}
                  {currentItem.totpConfig.account && (
                    <DetailField label="账户" copyValue={currentItem.totpConfig.account}>
                      {currentItem.totpConfig.account}
                    </DetailField>
                  )}

                  {/* TOTP 验证码显示 */}
                  <TOTPDisplay secret={currentItem.totpConfig.secret} />

                  {/* 配置信息 */}
                  <div className="mt-4 pt-4 border-t border-vault-border/50">
                    <h4 className="text-xs font-medium text-vault-text-muted mb-3">配置信息</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-vault-surface rounded-lg p-3">
                        <div className="text-[10px] text-vault-text-muted mb-1">算法</div>
                        <div className="text-sm text-vault-text font-mono">
                          {currentItem.totpConfig.algorithm}
                        </div>
                      </div>
                      <div className="bg-vault-surface rounded-lg p-3">
                        <div className="text-[10px] text-vault-text-muted mb-1">位数</div>
                        <div className="text-sm text-vault-text font-mono">
                          {currentItem.totpConfig.digits}位
                        </div>
                      </div>
                      <div className="bg-vault-surface rounded-lg p-3">
                        <div className="text-[10px] text-vault-text-muted mb-1">周期</div>
                        <div className="text-sm text-vault-text font-mono">
                          {currentItem.totpConfig.period}秒
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 密钥（需点击显示） */}
                  <div className="py-3 border-b border-vault-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-vault-text-muted">密钥</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                          title={showPrivateKey ? '隐藏密钥' : '显示密钥'}
                        >
                          <Shield size={14} />
                        </button>
                        {showPrivateKey && <CopyButton value={currentItem.totpConfig.secret} />}
                      </div>
                    </div>
                    <code className="text-xs font-mono text-vault-text-secondary">
                      {showPrivateKey ? currentItem.totpConfig.secret : '••••••••••••••••••••••'}
                    </code>
                  </div>
                </>
              )}

              {/* 编辑模式下的密钥输入 */}
              {isEditing && (
                <EditField
                  label="密钥 (Base32)"
                  value={formData.totpConfig?.secret || ''}
                  onChange={(val) => updateField('totpConfig', { ...formData.totpConfig, secret: val } as TOTPConfig)}
                  placeholder="输入 Base32 编码的密钥"
                  monospace
                />
              )}

              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- License 序列号类型 ---------- */}
          {itemType === 'license' && (
            <>
              {isEditing ? (
                <>
                  <EditField
                    label="序列号"
                    value={formData.licenseConfig?.serialNumber || ''}
                    onChange={(val) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), serialNumber: val })}
                    placeholder="输入序列号"
                    monospace
                  />
                  <EditField
                    label="产品名称"
                    value={formData.licenseConfig?.productName || ''}
                    onChange={(val) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), productName: val })}
                    placeholder="输入产品名称"
                  />
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="text-xs text-vault-text-muted mb-1.5">许可证类型</div>
                    <select
                      value={formData.licenseConfig?.licenseType || 'perpetual'}
                      onChange={(e) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), licenseType: e.target.value })}
                      className="w-full vault-input text-sm"
                    >
                      <option value="perpetual">永久许可</option>
                      <option value="subscription">订阅许可</option>
                      <option value="trial">试用许可</option>
                    </select>
                  </div>
                  <EditField
                    label="到期日期"
                    value={formData.licenseConfig?.expiryDate || ''}
                    onChange={(val) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), expiryDate: val })}
                    placeholder="YYYY-MM-DD"
                  />
                  <EditField
                    label="授权用户"
                    value={formData.licenseConfig?.issuedTo || ''}
                    onChange={(val) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), issuedTo: val })}
                    placeholder="输入授权用户"
                  />
                  <EditField
                    label="授权数量"
                    value={String(formData.licenseConfig?.numberOfSeats || '')}
                    onChange={(val) => updateField('licenseConfig', { ...(formData.licenseConfig || {}), numberOfSeats: Number(val) || undefined })}
                    placeholder="输入授权数量"
                    type="number"
                  />
                </>
              ) : (
                currentItem?.licenseConfig && (
                  <>
                    <DetailField label="序列号" copyValue={currentItem.licenseConfig.serialNumber}>
                      <span className="font-mono">{currentItem.licenseConfig.serialNumber}</span>
                    </DetailField>
                    {currentItem.licenseConfig.productName && (
                      <DetailField label="产品名称">
                        {currentItem.licenseConfig.productName}
                      </DetailField>
                    )}
                    <DetailField label="许可证类型">
                      <span className={cn('vault-badge',
                        currentItem.licenseConfig.licenseType === 'perpetual' && 'bg-vault-accent/20 text-vault-accent',
                        currentItem.licenseConfig.licenseType === 'subscription' && 'bg-vault-blue/20 text-vault-blue',
                        currentItem.licenseConfig.licenseType === 'trial' && 'bg-vault-orange/20 text-vault-orange'
                      )}>
                        {currentItem.licenseConfig.licenseType === 'perpetual' && '永久许可'}
                        {currentItem.licenseConfig.licenseType === 'subscription' && '订阅许可'}
                        {currentItem.licenseConfig.licenseType === 'trial' && '试用许可'}
                      </span>
                    </DetailField>
                    {currentItem.licenseConfig.expiryDate && (
                      <DetailField label="到期日期">
                        {currentItem.licenseConfig.expiryDate}
                      </DetailField>
                    )}
                    {currentItem.licenseConfig.issuedTo && (
                      <DetailField label="授权用户">
                        {currentItem.licenseConfig.issuedTo}
                      </DetailField>
                    )}
                    {currentItem.licenseConfig.numberOfSeats && (
                      <DetailField label="授权数量">
                        {currentItem.licenseConfig.numberOfSeats} 个席位
                      </DetailField>
                    )}
                  </>
                )
              )}
              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- 身份证类型 ---------- */}
          {itemType === 'id_card' && (
            <>
              {isEditing ? (
                <>
                  <EditField
                    label="姓名"
                    value={formData.idCardConfig?.name || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), name: val })}
                    placeholder="输入姓名"
                  />
                  <EditField
                    label="身份证号"
                    value={formData.idCardConfig?.idNumber || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), idNumber: val })}
                    placeholder="输入身份证号"
                    monospace
                  />
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="text-xs text-vault-text-muted mb-1.5">性别</div>
                    <select
                      value={formData.idCardConfig?.gender || 'male'}
                      onChange={(e) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), gender: e.target.value as 'male' | 'female' })}
                      className="w-full vault-input text-sm"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                  <EditField
                    label="民族"
                    value={formData.idCardConfig?.nationality || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), nationality: val })}
                    placeholder="输入民族"
                  />
                  <EditField
                    label="出生日期"
                    value={formData.idCardConfig?.birthDate || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), birthDate: val })}
                    placeholder="YYYY-MM-DD"
                  />
                  <EditField
                    label="住址"
                    value={formData.idCardConfig?.address || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), address: val })}
                    type="textarea"
                    placeholder="输入住址"
                  />
                  <EditField
                    label="签发日期"
                    value={formData.idCardConfig?.issueDate || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), issueDate: val })}
                    placeholder="YYYY-MM-DD"
                  />
                  <EditField
                    label="有效期限"
                    value={formData.idCardConfig?.expiryDate || ''}
                    onChange={(val) => updateField('idCardConfig', { ...(formData.idCardConfig || {}), expiryDate: val })}
                    placeholder="YYYY-MM-DD 或 长期"
                  />
                </>
              ) : (
                currentItem?.idCardConfig && (
                  <>
                    <DetailField label="姓名">{currentItem.idCardConfig.name}</DetailField>
                    <DetailField label="身份证号" copyValue={currentItem.idCardConfig.idNumber}>
                      <span className="font-mono">{currentItem.idCardConfig.idNumber}</span>
                    </DetailField>
                    <DetailField label="性别">
                      {currentItem.idCardConfig.gender === 'male' ? '男' : '女'}
                    </DetailField>
                    <DetailField label="民族">{currentItem.idCardConfig.nationality}</DetailField>
                    <DetailField label="出生日期">{currentItem.idCardConfig.birthDate}</DetailField>
                    <DetailField label="住址" copyValue={currentItem.idCardConfig.address}>
                      {currentItem.idCardConfig.address}
                    </DetailField>
                    <DetailField label="签发日期">{currentItem.idCardConfig.issueDate}</DetailField>
                    {currentItem.idCardConfig.expiryDate && (
                      <DetailField label="有效期限">{currentItem.idCardConfig.expiryDate}</DetailField>
                    )}
                  </>
                )
              )}
              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- 数据库类型 ---------- */}
          {itemType === 'database' && (
            <>
              {isEditing ? (
                <>
                  <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                    <div className="text-xs text-vault-text-muted mb-1.5">数据库类型</div>
                    <select
                      value={formData.databaseConfig?.databaseType || 'mysql'}
                      onChange={(e) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), databaseType: e.target.value })}
                      className="w-full vault-input text-sm"
                    >
                      <option value="mysql">MySQL</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="redis">Redis</option>
                      <option value="sqlite">SQLite</option>
                    </select>
                  </div>
                  <EditField
                    label="主机"
                    value={formData.databaseConfig?.host || ''}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), host: val })}
                    placeholder="localhost"
                  />
                  <EditField
                    label="端口"
                    value={String(formData.databaseConfig?.port || '')}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), port: Number(val) || undefined })}
                    placeholder="3306"
                    type="number"
                  />
                  <EditField
                    label="数据库名"
                    value={formData.databaseConfig?.databaseName || ''}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), databaseName: val })}
                    placeholder="输入数据库名"
                  />
                  <EditField
                    label="用户名"
                    value={formData.databaseConfig?.username || ''}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), username: val })}
                    placeholder="输入用户名"
                  />
                  <EditField
                    label="密码"
                    value={formData.databaseConfig?.password || ''}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), password: val })}
                    placeholder="输入密码"
                    type="password"
                  />
                  <EditField
                    label="连接字符串（可选）"
                    value={formData.databaseConfig?.connectionString || ''}
                    onChange={(val) => updateField('databaseConfig', { ...(formData.databaseConfig || {}), connectionString: val })}
                    placeholder="jdbc:mysql://localhost:3306/db"
                    monospace
                  />
                </>
              ) : (
                currentItem?.databaseConfig && (
                  <>
                    <DetailField label="数据库类型">
                      <span className="vault-badge bg-vault-accent/20 text-vault-accent uppercase">
                        {currentItem.databaseConfig.databaseType}
                      </span>
                    </DetailField>
                    <DetailField label="主机" copyValue={currentItem.databaseConfig.host}>
                      {currentItem.databaseConfig.host}
                    </DetailField>
                    {currentItem.databaseConfig.port && (
                      <DetailField label="端口">
                        <span className="font-mono">{currentItem.databaseConfig.port}</span>
                      </DetailField>
                    )}
                    <DetailField label="数据库名">{currentItem.databaseConfig.databaseName}</DetailField>
                    <DetailField label="用户名" copyValue={currentItem.databaseConfig.username}>
                      {currentItem.databaseConfig.username}
                    </DetailField>
                    {currentItem.databaseConfig.password && (
                      <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                        <div className="text-xs text-vault-text-muted mb-1">密码</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{showPrivateKey ? currentItem.databaseConfig.password : '••••••••'}</span>
                          <button
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                          >
                            <Shield size={14} />
                          </button>
                          {showPrivateKey && <CopyButton value={currentItem.databaseConfig.password} />}
                        </div>
                      </div>
                    )}
                    {currentItem.databaseConfig.connectionString && (
                      <DetailField label="连接字符串" copyValue={currentItem.databaseConfig.connectionString}>
                        <code className="text-xs font-mono break-all">{currentItem.databaseConfig.connectionString}</code>
                      </DetailField>
                    )}
                  </>
                )
              )}
              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}

          {/* ---------- API Key 类型 ---------- */}
          {itemType === 'api_key' && (
            <>
              {isEditing ? (
                <>
                  <EditField
                    label="服务商"
                    value={formData.apiKeyConfig?.provider || ''}
                    onChange={(val) => updateField('apiKeyConfig', { ...(formData.apiKeyConfig || {}), provider: val })}
                    placeholder="例如 OpenAI, AWS, Stripe"
                  />
                  <EditField
                    label="API Key"
                    value={formData.apiKeyConfig?.apiKey || ''}
                    onChange={(val) => updateField('apiKeyConfig', { ...(formData.apiKeyConfig || {}), apiKey: val })}
                    placeholder="输入 API Key"
                    monospace
                  />
                  <EditField
                    label="API Secret（可选）"
                    value={formData.apiKeyConfig?.apiSecret || ''}
                    onChange={(val) => updateField('apiKeyConfig', { ...(formData.apiKeyConfig || {}), apiSecret: val })}
                    placeholder="输入 API Secret"
                    type="password"
                    monospace
                  />
                  <EditField
                    label="权限范围（可选，逗号分隔）"
                    value={(formData.apiKeyConfig?.scopes || []).join(', ')}
                    onChange={(val) => updateField('apiKeyConfig', { ...(formData.apiKeyConfig || {}), scopes: val.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="read, write, admin"
                  />
                  <EditField
                    label="到期日期（可选）"
                    value={formData.apiKeyConfig?.expiryDate || ''}
                    onChange={(val) => updateField('apiKeyConfig', { ...(formData.apiKeyConfig || {}), expiryDate: val })}
                    placeholder="YYYY-MM-DD"
                  />
                </>
              ) : (
                currentItem?.apiKeyConfig && (
                  <>
                    <DetailField label="服务商">{currentItem.apiKeyConfig.provider}</DetailField>
                    <DetailField label="API Key" copyValue={currentItem.apiKeyConfig.apiKey}>
                      <code className="text-xs font-mono break-all">{currentItem.apiKeyConfig.apiKey}</code>
                    </DetailField>
                    {currentItem.apiKeyConfig.apiSecret && (
                      <div className="py-3 border-b border-vault-border/50 last:border-b-0">
                        <div className="text-xs text-vault-text-muted mb-1">API Secret</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono">{showPrivateKey ? currentItem.apiKeyConfig.apiSecret : '••••••••••••••••'}</code>
                          <button
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                          >
                            <Shield size={14} />
                          </button>
                          {showPrivateKey && currentItem.apiKeyConfig.apiSecret && <CopyButton value={currentItem.apiKeyConfig.apiSecret} />}
                        </div>
                      </div>
                    )}
                    {currentItem.apiKeyConfig.scopes && currentItem.apiKeyConfig.scopes.length > 0 && (
                      <DetailField label="权限范围">
                        <div className="flex flex-wrap gap-1">
                          {currentItem.apiKeyConfig.scopes.map((scope) => (
                            <span key={scope} className="vault-badge bg-vault-blue/20 text-vault-blue">{scope}</span>
                          ))}
                        </div>
                      </DetailField>
                    )}
                    {currentItem.apiKeyConfig.expiryDate && (
                      <DetailField label="到期日期">{currentItem.apiKeyConfig.expiryDate}</DetailField>
                    )}
                  </>
                )
              )}
              {/* 备注 */}
              {isEditing ? (
                <EditField
                  label="备注"
                  value={formData.notes || ''}
                  onChange={(val) => updateField('notes', val)}
                  type="textarea"
                  placeholder="添加备注..."
                />
              ) : (
                currentItem?.notes && (
                  <div className="py-3">
                    <span className="text-xs text-vault-text-muted">备注</span>
                    <p className="text-sm text-vault-text-secondary mt-1">{currentItem.notes}</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* ==================== 标签区域 ==================== */}
        <div className="vault-card p-6 mb-4">
          <h3 className="text-sm font-medium text-vault-text mb-3">标签</h3>

          {/* 标签展示 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {(formData.tags || []).map((tag) => (
              <span
                key={tag}
                className={cn('vault-badge gap-1', getTagColor(tag))}
              >
                {tag}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 hover:opacity-70 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
            {(formData.tags || []).length === 0 && !isEditing && (
              <span className="text-xs text-vault-text-muted">暂无标签</span>
            )}
          </div>

          {/* 编辑模式下的标签输入 */}
          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                }}
                placeholder="添加标签..."
                className="flex-1 vault-input text-xs py-1.5"
              />
              <button
                onClick={handleAddTag}
                className="p-1.5 rounded-lg bg-vault-accent/20 text-vault-accent hover:bg-vault-accent/30 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ==================== 自定义字段区域 ==================== */}
        {(isEditing || (currentItem?.customFields && currentItem.customFields.length > 0)) && (
          <div className="vault-card p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-vault-text">
                自定义字段 {currentItem?.customFields && currentItem.customFields.length > 0 ? `(${currentItem.customFields.length})` : ''}
              </h3>
              {isEditing && (
                <button
                  onClick={handleAddCustomField}
                  className="flex items-center gap-1 text-xs text-vault-accent hover:text-vault-accent/80 transition-colors"
                >
                  <Plus size={14} />
                  添加字段
                </button>
              )}
            </div>

            {/* 自定义字段列表 */}
            <div className="space-y-3">
              {(isEditing ? formData.customFields : currentItem?.customFields)?.map((field) => (
                <div key={field.id} className="flex items-start gap-3">
                  {isEditing ? (
                    <>
                      {/* 字段名称 */}
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                        placeholder="字段名称"
                        className="w-32 vault-input text-xs py-1.5 shrink-0"
                      />
                      {/* 字段类型 */}
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateCustomField(field.id, { type: e.target.value as CustomField['type'], value: '' })}
                        className="w-28 vault-input text-xs py-1.5 shrink-0"
                      >
                        <option value="text">文本</option>
                        <option value="password">密码</option>
                        <option value="date">日期</option>
                        <option value="private_note">私密备注</option>
                      </select>
                      {/* 字段值 */}
                      <input
                        type={field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : 'text'}
                        value={typeof field.value === 'string' ? field.value : ''}
                        onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                        placeholder="字段值"
                        className="flex-1 vault-input text-xs py-1.5 min-w-0"
                      />
                      {/* 删除按钮 */}
                      <button
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 查看模式 */}
                      <div className="w-32 shrink-0">
                        <span className="text-xs text-vault-text-muted">{field.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {field.type === 'password' ? (
                          <PasswordDisplay password={typeof field.value === 'string' ? field.value : ''} />
                        ) : field.type === 'private_note' ? (
                          <span className="text-xs text-vault-text-muted italic">私密字段</span>
                        ) : (
                          <span className="text-sm text-vault-text break-all">
                            {typeof field.value === 'string' ? field.value : ''}
                          </span>
                        )}
                      </div>
                      {field.type !== 'password' && field.type !== 'private_note' && typeof field.value === 'string' && field.value && (
                        <CopyButton value={field.value} className="shrink-0" />
                      )}
                    </>
                  )}
                </div>
              ))}
              {(!currentItem?.customFields || currentItem.customFields.length === 0) && !isEditing && (
                <span className="text-xs text-vault-text-muted">暂无自定义字段</span>
              )}
              {isEditing && (!formData.customFields || formData.customFields.length === 0) && (
                <span className="text-xs text-vault-text-muted">点击"添加字段"创建自定义字段</span>
              )}
            </div>
          </div>
        )}

        {/* ==================== 附件区域 ==================== */}
        {(isEditing || !!(currentItem?.attachments && currentItem.attachments.length > 0)) && (
          <div className="vault-card p-6 mb-4">
            <h3 className="text-sm font-medium text-vault-text mb-3">
              附件 {formData.attachments && formData.attachments.length > 0 ? `(${formData.attachments.length})` : ''}
            </h3>

            {/* 编辑模式：文件上传 */}
            {isEditing && (
              <div className="mb-4">
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-vault-border rounded-lg cursor-pointer hover:border-vault-accent/50 hover:bg-vault-accent/5 transition-colors">
                  <Upload size={16} className="text-vault-text-muted" />
                  <span className="text-sm text-vault-text-secondary">点击选择文件上传</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="text-xs text-vault-text-muted mt-2">支持图片、PDF、文档等格式，单个文件最大10MB</p>
              </div>
            )}

            {/* 附件列表 */}
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-vault-surface hover:bg-vault-hover transition-colors"
                  >
                    <File size={16} className="text-vault-text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-vault-text truncate">{att.name}</div>
                      <div className="text-xs text-vault-text-muted">
                        {formatFileSize(att.size)} · {formatDate(att.createdAt)}
                      </div>
                    </div>
                    {isEditing ? (
                      <button
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(att)}
                        className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
                        title="下载"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 查看模式：删除按钮 */}
            {!isEditing && currentItem?.attachments && currentItem.attachments.length > 0 && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 text-xs text-vault-text-muted hover:text-vault-accent transition-colors flex items-center gap-1"
              >
                <Pencil size={12} />
                管理附件
              </button>
            )}
          </div>
        )}

        {/* ==================== 密码历史区域 ==================== */}
        {itemType === 'login' && currentItem?.passwordHistory && currentItem.passwordHistory.length > 0 && (
          <div className="vault-card p-6 mb-4">
            <PasswordHistory
              history={currentItem.passwordHistory}
              itemId={currentItem.id}
              onRollbackSuccess={() => {
                setRollbackSuccess(true);
                setTimeout(() => setRollbackSuccess(false), 3000);
                if (existingItem) {
                  const updatedItem = items.list.find((item) => item.id === existingItem.id);
                  if (updatedItem) {
                    setFormData({ ...updatedItem });
                  }
                }
              }}
            />
            {rollbackSuccess && (
              <div className="mt-3 p-2 bg-vault-success/10 border border-vault-success/20 rounded-lg flex items-center gap-2 text-vault-success text-xs">
                <Check size={14} />
                密码已成功回滚
              </div>
            )}
          </div>
        )}

        {/* ==================== 分享信息区域 ==================== */}
        <div className="vault-card p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-vault-text">访问权限</h3>
            <button
              onClick={() => setShowShareModal(true)}
              className="text-xs text-vault-accent hover:text-vault-accent-hover transition-colors"
            >
              管理共享
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-vault-accent/20 text-vault-accent flex items-center justify-center text-xs font-bold">
                你
              </div>
              <div className="flex-1">
                <div className="text-sm text-vault-text">仅自己</div>
                <div className="text-xs text-vault-text-muted">此条目未分享给其他人</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-vault-accent/20 text-vault-accent">
                所有者
              </span>
            </div>
            {currentItem?.sharedWith && currentItem.sharedWith.length > 0 && currentItem.sharedWith.map((share) => (
              <div key={share.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-vault-hover text-vault-text-secondary flex items-center justify-center text-xs font-bold">
                  {share.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-vault-text">{share.email}</div>
                  <div className="text-xs text-vault-text-muted">{share.permission === 'view' ? '可查看' : '可编辑'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== 元数据区域 ==================== */}
        <div className="vault-card p-6 mb-4">
          <h3 className="text-sm font-medium text-vault-text mb-3">详细信息</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-vault-text-muted">创建时间</span>
              <div className="text-vault-text-secondary mt-0.5">
                {currentItem?.createdAt ? formatDate(currentItem.createdAt) : '-'}
              </div>
            </div>
            <div>
              <span className="text-vault-text-muted">最后修改</span>
              <div className="text-vault-text-secondary mt-0.5">
                {currentItem?.updatedAt ? formatDate(currentItem.updatedAt) : '-'}
              </div>
            </div>
            <div>
              <span className="text-vault-text-muted">所属保险库</span>
              <div className="text-vault-text-secondary mt-0.5">{vaultName || '-'}</div>
            </div>
            <div>
              <span className="text-vault-text-muted">类型</span>
              <div className="text-vault-text-secondary mt-0.5">{typeInfo.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 共享设置模态框 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-vault-text">共享设置</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded hover:bg-vault-hover transition-colors"
              >
                <X size={18} className="text-vault-text-muted" />
              </button>
            </div>

            {shareSuccessMessage && (
              <div className="mb-4 p-2 bg-vault-success/10 border border-vault-success/20 rounded-lg flex items-center gap-2 text-vault-success text-xs animate-fade-in">
                <Check size={14} />
                {shareSuccessMessage}
              </div>
            )}

            {/* 添加共享对象 */}
            <div className="space-y-3 mb-4">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="输入邮箱地址"
                className="vault-input w-full"
              />
              <div className="flex gap-2">
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                  className="vault-input flex-1"
                >
                  <option value="view">可查看</option>
                  <option value="edit">可编辑</option>
                </select>
                <button
                  onClick={() => {
                    const email = shareEmail.trim();
                    if (!email) return;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      alert('请输入有效的邮箱地址');
                      return;
                    }
                    if (existingItem) {
                      items.shareItem(existingItem.id, email, sharePermission);
                      setShareEmail('');
                      setShareSuccessMessage(`已成功共享给 ${email}`);
                      setTimeout(() => setShareSuccessMessage(''), 2000);
                    }
                  }}
                  className="vault-btn-primary"
                  disabled={!shareEmail.trim()}
                >
                  添加
                </button>
              </div>
            </div>

            {/* 已共享列表 */}
            {existingItem?.sharedWith && existingItem.sharedWith.length > 0 && (
              <div className="border-t border-vault-border/50 pt-4 mb-4">
                <p className="text-xs text-vault-text-muted mb-2">已共享给：</p>
                <div className="space-y-2">
                  {existingItem.sharedWith.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-2 rounded-lg bg-vault-hover/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-vault-accent/20 text-vault-accent flex items-center justify-center text-xs">
                          {share.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-vault-text">{share.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={share.permission}
                          onChange={(e) => {
                            const newPermission = e.target.value as 'view' | 'edit';
                            if (existingItem) {
                              items.updateSharePermission(existingItem.id, share.id, newPermission);
                              setShareSuccessMessage(`${share.email} 的权限已更新为 ${newPermission === 'view' ? '查看' : '编辑'}`);
                              setTimeout(() => setShareSuccessMessage(''), 2000);
                            }
                          }}
                          className="vault-input text-xs px-2 py-1 h-8"
                        >
                          <option value="view">查看</option>
                          <option value="edit">编辑</option>
                        </select>
                        <button
                          onClick={() => {
                            if (existingItem) {
                              items.unshareItem(existingItem.id, share.id);
                              setShareSuccessMessage(`已取消与 ${share.email} 的共享`);
                              setTimeout(() => setShareSuccessMessage(''), 2000);
                            }
                          }}
                          className="p-1 rounded hover:bg-vault-warn/20 text-vault-text-muted hover:text-vault-warn transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="vault-btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="vault-btn-primary flex-1"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
