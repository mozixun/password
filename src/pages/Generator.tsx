// VaultKey 密码管理器 - 密码生成器页面
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, History, Trash2, Clock, Copy, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import CopyButton from '@/components/CopyButton';
import { useGenerator } from '@/store';
import { cn } from '@/lib/utils';
import type { GeneratedPasswordHistory } from '@/types';

// 根据字符类型获取颜色类名
function getCharClass(char: string): string {
  if (/[a-z]/.test(char)) return 'char-lower';
  if (/[A-Z]/.test(char)) return 'char-upper';
  if (/[0-9]/.test(char)) return 'char-digit';
  return 'char-symbol';
}

// 计算密码强度 (0-100)
function calculateStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  // 长度得分
  score += Math.min(password.length * 4, 40);
  // 字符种类得分
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  // 额外长度奖励
  if (password.length >= 16) score += 15;
  else if (password.length >= 12) score += 10;
  return Math.min(score, 100);
}

// 强度等级
function getStrengthLevel(score: number): { label: string; color: string; width: string } {
  if (score >= 80) return { label: '强', color: 'bg-vault-accent', width: '100%' };
  if (score >= 50) return { label: '中等', color: 'bg-vault-orange', width: '65%' };
  return { label: '弱', color: 'bg-vault-warn', width: '30%' };
}

// 开关组件
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!checked)}>
      <span className="text-sm text-vault-text-secondary group-hover:text-vault-text transition-colors">{label}</span>
      <div className={cn('relative w-10 h-5 rounded-full transition-colors duration-200', checked ? 'bg-vault-accent' : 'bg-vault-border')}>
        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </div>
    </div>
  );
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 历史记录条目
function HistoryItem({ item, onCopy, onDelete }: {
  item: GeneratedPasswordHistory;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const strengthColors: Record<string, string> = {
    weak: 'text-vault-warn',
    fair: 'text-vault-orange',
    good: 'text-vault-blue',
    strong: 'text-vault-accent',
  };

  const strengthLabels: Record<string, string> = {
    weak: '弱',
    fair: '中等',
    good: '良好',
    strong: '强',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-vault-hover/30 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-vault-surface flex items-center justify-center shrink-0">
        <Clock size={14} className="text-vault-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-vault-text truncate">
            {showPassword ? item.password : '••••••••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-0.5 rounded text-vault-text-muted hover:text-vault-text transition-colors opacity-0 group-hover:opacity-100"
            title={showPassword ? '隐藏' : '显示'}
          >
            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-vault-text-muted">
            {item.type === 'password' ? '密码' : '密码短语'}
          </span>
          <span className="text-xs text-vault-text-muted">·</span>
          <span className={`text-xs ${strengthColors[item.strength.label]}`}>
            {strengthLabels[item.strength.label]}
          </span>
          <span className="text-xs text-vault-text-muted">·</span>
          <span className="text-xs text-vault-text-muted">
            {formatDate(item.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="p-1.5 rounded-md text-vault-text-muted hover:text-vault-accent hover:bg-vault-accent/10 transition-colors"
          title="复制"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// 密码短语相关状态（本地管理，生成器 store 不包含这些字段）
const SEPARATORS = [
  { label: '连字符', value: '-' },
  { label: '句点', value: '.' },
  { label: '空格', value: ' ' },
  { label: '逗号', value: ',' },
];

// 密码短语词库
const PASSPHRASE_WORDS = [
  '星空', '大海', '山川', '流水', '白云', '清风', '明月', '晨光',
  '松柏', '竹林', '花园', '溪谷', '彩虹', '雪花', '春雨', '秋叶',
  '骏马', '飞鹰', '锦鲤', '白鹤', '青鸾', '灵鹿', '雪豹', '云雀',
  '晨曦', '暮色', '朝阳', '碧波', '银沙', '翠竹', '幽兰', '红梅',
];

export default function Generator() {
  const generator = useGenerator();
  const [activeTab, setActiveTab] = useState<'password' | 'passphrase'>('password');

  // 密码短语本地设置
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  // 可读性选项
  const [readableMode, setReadableMode] = useState<'standard' | 'unambiguous' | 'random'>('standard');

  // 生成密码短语
  const generatePassphraseLocal = useCallback(() => {
    const array = new Uint32Array(wordCount);
    crypto.getRandomValues(array);
    let words = Array.from(array, (v) => PASSPHRASE_WORDS[v % PASSPHRASE_WORDS.length]);

    if (capitalize) {
      words = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    }
    if (includeNumbers) {
      const numArray = new Uint32Array(1);
      crypto.getRandomValues(numArray);
      words[words.length - 1] += String(numArray[0] % 100);
    }

    return words.join(separator);
  }, [wordCount, separator, capitalize, includeNumbers]);

  // 刷新密码
  const handleRefresh = useCallback(() => {
    if (activeTab === 'password') {
      generator.generatePassword();
    } else {
      const passphrase = generatePassphraseLocal();
      generator.addToHistory(passphrase, 'passphrase', passphrase.length);
    }
  }, [activeTab, generator, generatePassphraseLocal]);

  // 当前显示的密码
  const displayPassword = activeTab === 'password'
    ? generator.generatedPassword
    : generator.history.find(h => h.type === 'passphrase')?.password || generatePassphraseLocal();

  // 当切换 tab 或参数变化时自动刷新
  useEffect(() => {
    if (activeTab === 'password') {
      generator.generatePassword();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, generator.length, generator.uppercase, generator.lowercase, generator.digits, generator.symbols, generator.readable, readableMode]);

  // 强度计算
  const strength = calculateStrength(displayPassword);
  const strengthInfo = getStrengthLevel(strength);

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto animate-fade-in">
        {/* 页面标题 */}
        <h1 className="text-xl font-display font-bold text-vault-text mb-6">密码生成器</h1>

        {/* 主卡片 */}
        <div className="vault-card p-6 space-y-6">
          {/* 密码预览区域 */}
          <div className="bg-vault-surface rounded-xl p-4 border border-vault-border">
            <div className="flex items-center gap-3">
              {/* 密码字符显示 */}
              <div className="flex-1 font-mono text-lg break-all leading-relaxed min-h-[2rem]">
                {displayPassword.split('').map((char, index) => (
                  <span key={index} className={getCharClass(char)}>
                    {char}
                  </span>
                ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 shrink-0">
                <CopyButton value={displayPassword} />
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg text-vault-text-muted hover:text-vault-accent hover:bg-vault-hover transition-all duration-200"
                  title="刷新"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 密码强度指示器 */}
          {activeTab === 'password' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-vault-text-muted">密码强度</span>
                <span className={cn(
                  'text-xs font-medium',
                  strength >= 80 ? 'text-vault-accent' : strength >= 50 ? 'text-vault-orange' : 'text-vault-warn'
                )}>
                  {strengthInfo.label}
                </span>
              </div>
              <div className="h-1.5 bg-vault-surface rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', strengthInfo.color)}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          )}

          {/* Tab 切换 */}
          <div className="flex bg-vault-surface rounded-lg p-1 border border-vault-border">
            <button
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200',
                activeTab === 'password'
                  ? 'bg-vault-accent/15 text-vault-accent'
                  : 'text-vault-text-muted hover:text-vault-text'
              )}
              onClick={() => setActiveTab('password')}
            >
              密码
            </button>
            <button
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200',
                activeTab === 'passphrase'
                  ? 'bg-vault-accent/15 text-vault-accent'
                  : 'text-vault-text-muted hover:text-vault-text'
              )}
              onClick={() => setActiveTab('passphrase')}
            >
              密码短语
            </button>
          </div>

          {/* 密码设置 */}
          {activeTab === 'password' ? (
            <div className="space-y-5">
              {/* 长度滑块 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vault-text-secondary">长度</span>
                  <span className="text-sm font-mono font-medium text-vault-accent">{generator.length}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={64}
                  value={generator.length}
                  onChange={(e) => generator.setLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-vault-surface rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-vault-accent
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-vault-accent/30
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between text-xs text-vault-text-muted">
                  <span>4</span>
                  <span>64</span>
                </div>
              </div>

              {/* 字符类型开关 */}
              <div className="space-y-3">
                <span className="text-sm text-vault-text-secondary">字符类型</span>
                <div className="space-y-2.5">
                  <Toggle
                    checked={generator.uppercase}
                    onChange={generator.setUppercase}
                    label="大写字母 (A-Z)"
                  />
                  <Toggle
                    checked={generator.lowercase}
                    onChange={generator.setLowercase}
                    label="小写字母 (a-z)"
                  />
                  <Toggle
                    checked={generator.digits}
                    onChange={generator.setDigits}
                    label="数字 (0-9)"
                  />
                  <Toggle
                    checked={generator.symbols}
                    onChange={generator.setSymbols}
                    label="符号 (!@#$...)"
                  />
                </div>
              </div>

              {/* 可读性下拉 */}
              <div className="space-y-2">
                <span className="text-sm text-vault-text-secondary">可读性</span>
                <select
                  value={readableMode}
                  onChange={(e) => {
                    const mode = e.target.value as 'standard' | 'unambiguous' | 'random';
                    setReadableMode(mode);
                    generator.setReadable(mode === 'unambiguous');
                  }}
                  className="w-full vault-input text-sm py-2.5 appearance-none cursor-pointer"
                >
                  <option value="standard">标准</option>
                  <option value="unambiguous">无歧义字符</option>
                  <option value="random">完全随机</option>
                </select>
              </div>
            </div>
          ) : (
            /* 密码短语设置 */
            <div className="space-y-5">
              {/* 词语数量滑块 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vault-text-secondary">词语数量</span>
                  <span className="text-sm font-mono font-medium text-vault-accent">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-vault-surface rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-vault-accent
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-vault-accent/30
                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
                />
                <div className="flex justify-between text-xs text-vault-text-muted">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              {/* 分隔符选择 */}
              <div className="space-y-2">
                <span className="text-sm text-vault-text-secondary">分隔符</span>
                <div className="flex gap-2">
                  {SEPARATORS.map((sep) => (
                    <button
                      key={sep.value}
                      onClick={() => setSeparator(sep.value)}
                      className={cn(
                        'flex-1 py-2 text-sm rounded-lg border transition-all duration-200',
                        separator === sep.value
                          ? 'bg-vault-accent/15 text-vault-accent border-vault-accent/30'
                          : 'bg-vault-surface text-vault-text-muted border-vault-border hover:border-vault-accent/20 hover:text-vault-text'
                      )}
                    >
                      {sep.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 大写首字母开关 */}
              <Toggle
                checked={capitalize}
                onChange={setCapitalize}
                label="大写首字母"
              />

              {/* 包含数字开关 */}
              <Toggle
                checked={includeNumbers}
                onChange={setIncludeNumbers}
                label="包含数字"
              />
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <div className="vault-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={18} className="text-vault-accent" />
              <h2 className="text-base font-semibold text-vault-text">历史记录</h2>
              <span className="vault-badge bg-vault-surface text-vault-text-muted">
                {generator.history.length} / 50
              </span>
            </div>
            {generator.history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清空所有历史记录吗？')) {
                    generator.clearHistory();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-vault-text-muted hover:text-vault-warn transition-colors"
              >
                <Trash2 size={14} />
                清空
              </button>
            )}
          </div>

          {generator.history.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-vault-surface flex items-center justify-center">
                <History size={24} className="text-vault-text-muted" />
              </div>
              <p className="text-sm text-vault-text-muted">暂无历史记录</p>
              <p className="text-xs text-vault-text-muted mt-1">生成的密码将自动保存到历史记录中</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto -mx-2 px-2">
              {generator.history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onCopy={() => navigator.clipboard.writeText(item.password)}
                  onDelete={() => generator.removeFromHistory(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
