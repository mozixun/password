// VaultKey 密码管理器 - 安全中心页面
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Copy as CopyIcon,
  RefreshCw,
  Lock,
  KeyRound,
  CreditCard,
  User,
  FileText,
  Terminal,
  Paperclip,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Fingerprint,
  Smartphone,
  Shield,
  Building2,
  Database,
  Search,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import SecurityScore from '@/components/SecurityScore';
import { useWatchtower, useItems, useProfile } from '@/store';
import type { VaultItem, ItemType } from '@/types';
import { cn } from '@/lib/utils';
import { checkEmailBreaches, type BreachResult } from '@/utils/breachDetection';
import { toast } from '@/components/Toast';

// Tab 类型定义
type WatchtowerTab = 'weak' | 'reused' | 'compromised' | 'expired' | 'missing_2fa';

// 根据项目类型获取图标
function getItemIcon(type: ItemType) {
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

// 估算密码强度
function estimatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}

// 强度指示条组件
function StrengthBar({ strength }: { strength: 'weak' | 'medium' | 'strong' }) {
  const config = {
    weak: { color: 'bg-vault-warn', width: '33%', label: '弱' },
    medium: { color: 'bg-vault-orange', width: '66%', label: '中等' },
    strong: { color: 'bg-vault-accent', width: '100%', label: '强' },
  };
  const { color, width, label } = config[strength];
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-vault-surface rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width }} />
      </div>
      <span className={cn(
        'text-xs',
        strength === 'weak' ? 'text-vault-warn' : strength === 'medium' ? 'text-vault-orange' : 'text-vault-accent'
      )}>
        {label}
      </span>
    </div>
  );
}

// 分数卡片组件
function ScoreCard({ icon, label, count, color }: { icon: React.ReactNode; label: string; count: number; color: string }) {
  return (
    <div className="vault-card p-4 flex flex-col items-center gap-2">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
        {icon}
      </div>
      <span className="text-2xl font-display font-bold text-vault-text">{count}</span>
      <span className="text-xs text-vault-text-muted">{label}</span>
    </div>
  );
}

// 空安全状态组件
function SafeState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-vault-accent/15 flex items-center justify-center mb-4">
        <CheckCircle2 size={32} className="text-vault-accent" />
      </div>
      <p className="text-lg font-medium text-vault-text">一切安全！</p>
      <p className="text-sm text-vault-text-muted mt-1">没有发现安全问题</p>
    </div>
  );
}

export default function Watchtower() {
  const navigate = useNavigate();
  const watchtower = useWatchtower();
  const { summary, alerts } = watchtower;
  const { list: items } = useItems();
  const profile = useProfile();
  const [activeTab, setActiveTab] = useState<WatchtowerTab>('weak');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCheckingBreaches, setIsCheckingBreaches] = useState(false);
  const [breachResults, setBreachResults] = useState<BreachResult[]>([]);

  // 运行泄露检测
  const runBreachCheck = async () => {
    setIsCheckingBreaches(true);
    try {
      const results = await checkEmailBreaches(profile.profile.email);
      setBreachResults(results);
    } catch {
      setBreachResults([]);
      toast.error('泄露检测服务暂时不可用，请检查网络连接后重试');
    } finally {
      setIsCheckingBreaches(false);
    }
  };

  // 页面 mount 时运行完整安全审计
  useEffect(() => {
    watchtower.runFullAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 按类型分组告警
  const weakAlerts = useMemo(() => alerts.filter((a) => a.type === 'weak'), [alerts]);
  const compromisedAlerts = useMemo(() => alerts.filter((a) => a.type === 'compromised'), [alerts]);
  const expiredAlerts = useMemo(() => alerts.filter((a) => a.type === 'expired'), [alerts]);

  // 缺失2FA的登录项目
  const missing2FAItems = useMemo(() => {
    return items.filter(
      (item) => item.type === 'login' && !item.totp && !item.passkey && !item.trashedAt,
    );
  }, [items]);

  // 按密码分组（用于重复密码标签页）
  const reusedGroups = useMemo(() => {
    const passwordMap = new Map<string, VaultItem[]>();
    items.forEach((item) => {
      if (item.password && !item.trashedAt) {
        const existing = passwordMap.get(item.password) || [];
        existing.push(item);
        passwordMap.set(item.password, existing);
      }
    });
    const groups: { password: string; items: VaultItem[] }[] = [];
    passwordMap.forEach((groupItems, password) => {
      if (groupItems.length > 1) {
        groups.push({ password, items: groupItems });
      }
    });
    return groups;
  }, [items]);

  // 切换展开/折叠
  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Tab 配置
  const tabs: { key: WatchtowerTab; label: string; count: number }[] = [
    { key: 'weak', label: '弱密码', count: summary.weakPasswords },
    { key: 'reused', label: '重复密码', count: summary.reusedPasswords },
    { key: 'compromised', label: '已泄露', count: summary.compromisedPasswords },
    { key: 'missing_2fa', label: '缺失2FA', count: summary.missing2FA },
    { key: 'expired', label: '已过期', count: summary.expiredItems },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* 页面头部 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-vault-accent/15 flex items-center justify-center">
            <ShieldCheck size={22} className="text-vault-accent" />
          </div>
          <h1 className="text-xl font-display font-bold text-vault-text">安全中心</h1>
        </div>

        {/* 安全评分卡片 */}
        <div className="vault-card p-6 mb-4">
          <SecurityScore score={summary.score} />
        </div>

        {/* 分数明细卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <ScoreCard
            icon={<AlertTriangle size={18} className="text-vault-warn" />}
            label="弱密码"
            count={summary.weakPasswords}
            color="bg-vault-warn/15"
          />
          <ScoreCard
            icon={<CopyIcon size={18} className="text-vault-orange" />}
            label="重复密码"
            count={summary.reusedPasswords}
            color="bg-vault-orange/15"
          />
          <ScoreCard
            icon={<Lock size={18} className="text-vault-warn" />}
            label="已泄露"
            count={summary.compromisedPasswords}
            color="bg-vault-warn/15"
          />
          <ScoreCard
            icon={<RefreshCw size={18} className="text-vault-blue" />}
            label="已过期"
            count={summary.expiredItems}
            color="bg-vault-blue/15"
          />
        </div>

        {/* Tab 导航 */}
        <div className="flex bg-vault-surface rounded-lg p-1 border border-vault-border mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-1.5',
                activeTab === tab.key
                  ? 'bg-vault-accent/15 text-vault-accent'
                  : 'text-vault-text-muted hover:text-vault-text'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
                  activeTab === tab.key
                    ? 'bg-vault-accent/25 text-vault-accent'
                    : 'bg-vault-border text-vault-text-muted'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 内容 */}
        <div className="space-y-3">
          {/* 弱密码标签页 */}
          {activeTab === 'weak' && (
            weakAlerts.length === 0 ? <SafeState /> : (
              <div className="space-y-2">
                {weakAlerts.map((alert) => {
                  const item = items.find((i) => i.id === alert.itemId);
                  if (!item) return null;
                  const strength = item.password ? estimatePasswordStrength(item.password) : 'weak';
                  return (
                    <div key={alert.id} className="vault-card p-4">
                      <div className="flex items-center gap-3">
                        {/* 图标 */}
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', getIconBg(item.type))}>
                          {getItemIcon(item.type)}
                        </div>
                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-vault-text">{item.title}</h3>
                          <p className="text-xs text-vault-text-secondary mt-0.5">{item.username || item.email || ''}</p>
                          <div className="mt-1.5">
                            <StrengthBar strength={strength} />
                          </div>
                        </div>
                        {/* 更新按钮 */}
                        <button
                          onClick={() => navigate(`/items/detail/${alert.itemId}`)}
                          className="vault-btn-primary text-xs py-1.5 px-3 shrink-0"
                        >
                          更新密码
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 重复密码标签页 */}
          {activeTab === 'reused' && (
            reusedGroups.length === 0 ? <SafeState /> : (
              <div className="space-y-2">
                {reusedGroups.map((group) => {
                  const groupKey = group.password;
                  const isExpanded = expandedGroups.has(groupKey);
                  return (
                    <div key={groupKey} className="vault-card overflow-hidden">
                      {/* 分组标题 */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-vault-hover/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-vault-orange/15 shrink-0">
                          <CopyIcon size={16} className="text-vault-orange" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-vault-text">重复密码</span>
                            <span className="vault-badge bg-vault-orange/15 text-vault-orange text-[10px]">
                              {group.items.length} 次使用
                            </span>
                          </div>
                          <p className="text-xs text-vault-text-muted mt-0.5 font-mono">
                            {'•'.repeat(Math.min(group.password.length, 12))}
                          </p>
                        </div>
                        <div className="text-vault-text-muted shrink-0">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </button>
                      {/* 展开的条目列表 */}
                      {isExpanded && (
                        <div className="border-t border-vault-border">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-vault-border last:border-b-0"
                            >
                              <div className={cn('w-7 h-7 rounded flex items-center justify-center shrink-0', getIconBg(item.type))}>
                                {getItemIcon(item.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-vault-text">{item.title}</span>
                                <span className="text-xs text-vault-text-muted ml-2">{item.username || ''}</span>
                              </div>
                              <button
                                onClick={() => navigate(`/items/detail/${item.id}`)}
                                className="text-xs text-vault-accent hover:text-vault-accent-hover transition-colors shrink-0"
                              >
                                更新
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* 已泄露标签页 */}
          {activeTab === 'compromised' && (
            <div className="space-y-4">
              {/* 泄露检测按钮 */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-vault-text-secondary">
                  检查您的邮箱是否出现在已知的数据泄露中
                </p>
                <button
                  onClick={runBreachCheck}
                  disabled={isCheckingBreaches}
                  className="vault-btn-secondary flex items-center gap-2"
                >
                  <Search size={16} className={isCheckingBreaches ? 'animate-spin' : ''} />
                  {isCheckingBreaches ? '检测中...' : '运行检测'}
                </button>
              </div>

              {/* 泄露检测结果 */}
              {breachResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-vault-warn font-medium">
                    发现 {breachResults.length} 个数据泄露涉及您的邮箱
                  </p>
                  {breachResults.map((breach) => (
                    <div key={breach.id} className="vault-card p-4 border-vault-warn/30">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-vault-warn/15 flex items-center justify-center shrink-0">
                          <Shield size={18} className="text-vault-warn" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-vault-text">{breach.title}</h3>
                            <span className="vault-badge bg-vault-warn/15 text-vault-warn text-[10px]">
                              {new Date(breach.breachDate).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-xs text-vault-text-secondary mt-1 line-clamp-2">
                            {breach.description}
                          </p>
                          <p className="text-xs text-vault-text-muted mt-2">
                            泄露数据: {breach.dataClasses.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 原有泄露告警 */}
              {compromisedAlerts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-vault-text-muted">密码泄露告警:</p>
                  {compromisedAlerts.map((alert) => {
                    const item = items.find((i) => i.id === alert.itemId);
                    if (!item) return null;
                    return (
                      <div key={alert.id} className="vault-card p-4 border-vault-warn/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-vault-warn/15 shrink-0">
                            <Lock size={16} className="text-vault-warn" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-vault-text">{item.title}</h3>
                              <span className="vault-badge bg-vault-warn/15 text-vault-warn text-[10px]">
                                严重
                              </span>
                            </div>
                            <p className="text-xs text-vault-text-secondary mt-0.5">{item.username || item.email || ''}</p>
                            {alert.description && (
                              <p className="text-xs text-vault-text-muted mt-1">{alert.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/items/detail/${alert.itemId}`)}
                            className="vault-btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-vault-warn to-vault-warn-dim shrink-0"
                          >
                            立即修改
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 安全状态 */}
              {compromisedAlerts.length === 0 && breachResults.length === 0 && (
                <SafeState />
              )}
            </div>
          )}

          {/* 缺失2FA标签页 */}
          {activeTab === 'missing_2fa' && (
            missing2FAItems.length === 0 ? <SafeState /> : (
              <div className="space-y-2">
                <div className="vault-card p-4 mb-4 bg-vault-accent/5 border-vault-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-vault-accent/15 flex items-center justify-center shrink-0">
                      <Smartphone size={20} className="text-vault-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-vault-text mb-1">为什么要启用两步验证？</h3>
                      <p className="text-xs text-vault-text-secondary leading-relaxed">
                        两步验证（2FA）为您的账户增加了额外的安全层。即使密码泄露，攻击者也需要第二个验证因素才能登录。
                        建议为所有重要账户启用 TOTP 或通行密钥验证。
                      </p>
                    </div>
                  </div>
                </div>
                {missing2FAItems.map((item) => (
                  <div key={item.id} className="vault-card p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', getIconBg(item.type))}>
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-vault-text">{item.title}</h3>
                          <span className="vault-badge bg-vault-orange/15 text-vault-orange text-[10px]">
                            建议开启
                          </span>
                        </div>
                        <p className="text-xs text-vault-text-secondary mt-0.5">{item.username || item.email || ''}</p>
                        {item.url && (
                          <p className="text-xs text-vault-text-muted mt-0.5 truncate">{item.url}</p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/items/detail/${item.id}`)}
                        className="vault-btn-secondary text-xs py-1.5 px-3 shrink-0"
                      >
                        去设置
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 已过期标签页 */}
          {activeTab === 'expired' && (
            expiredAlerts.length === 0 ? <SafeState /> : (
              <div className="space-y-2">
                {expiredAlerts.map((alert) => {
                  const item = items.find((i) => i.id === alert.itemId);
                  if (!item) return null;
                  const expiry = item.expiryDate;
                  return (
                    <div key={alert.id} className="vault-card p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', getIconBg(item.type))}>
                          {getItemIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-vault-text">{item.title}</h3>
                          <p className="text-xs text-vault-text-secondary mt-0.5">{item.username || item.cardholderName || ''}</p>
                          {expiry && (
                            <p className="text-xs text-vault-warn mt-1">
                              过期日期：{expiry}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/items/detail/${alert.itemId}`)}
                          className="vault-btn-secondary text-xs py-1.5 px-3 shrink-0"
                        >
                          更新
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
}
