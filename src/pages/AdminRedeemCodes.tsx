import { useState, useMemo } from 'react';
import {
  Gift,
  Plus,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Tag,
  Clock,
  Users,
  Check,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAdmin } from '@/store';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types';

const PLAN_OPTIONS: { value: SubscriptionPlan; label: string; color: string }[] = [
  { value: 'premium', label: 'Premium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'family', label: 'Family', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'team', label: 'Team', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
];

function getPlanBadge(planType: SubscriptionPlan) {
  const plan = PLAN_OPTIONS.find((p) => p.value === planType);
  return plan ? plan.color : 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

function getPlanLabel(planType: SubscriptionPlan) {
  const plan = PLAN_OPTIONS.find((p) => p.value === planType);
  return plan ? plan.label : planType;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatus(code: { enabled: boolean; expiresAt: string; usedCount: number; totalUses: number }) {
  const now = new Date();
  const expired = new Date(code.expiresAt) < now;
  const exhausted = code.usedCount >= code.totalUses;

  if (expired || exhausted) {
    return { label: '已过期', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (!code.enabled) {
    return { label: '已禁用', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  }
  return { label: '有效', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

export default function AdminRedeemCodes() {
  const admin = useAdmin();
  const redeemCodes = admin.settings.redeemCodes;

  const [planType, setPlanType] = useState<SubscriptionPlan>('premium');
  const [subscriptionDays, setSubscriptionDays] = useState(30);
  const [totalUses, setTotalUses] = useState(1);
  const [batchCount, setBatchCount] = useState(1);
  const [customCode, setCustomCode] = useState('');
  // 使用截止日期，默认30天后
  const defaultExpiresDate = new Date();
  defaultExpiresDate.setDate(defaultExpiresDate.getDate() + 30);
  const [expiresDate, setExpiresDate] = useState(defaultExpiresDate.toISOString().split('T')[0]);

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredCodes = useMemo(() => {
    if (!searchQuery.trim()) return redeemCodes;
    const q = searchQuery.trim().toLowerCase();
    return redeemCodes.filter(
      (rc) =>
        rc.code.toLowerCase().includes(q) || rc.planType.toLowerCase().includes(q)
    );
  }, [redeemCodes, searchQuery]);

  const handleGenerate = () => {
    if (subscriptionDays < 1 || totalUses < 1) {
      setMessage({ type: 'error', text: '套餐天数和使用次数至少为 1' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    if (batchCount < 1 || batchCount > 100) {
      setMessage({ type: 'error', text: '批量生成数量必须在 1-100 之间' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    if (!expiresDate) {
      setMessage({ type: 'error', text: '请选择使用截止日期' });
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    const count = Math.min(Math.max(batchCount, 1), 100);
    for (let i = 0; i < count; i++) {
      admin.generateRedeemCode(
        planType,
        expiresDate,
        totalUses,
        subscriptionDays,
        i === 0 ? customCode || undefined : undefined
      );
    }

    setMessage({ type: 'success', text: `成功生成 ${count} 个兑换码` });
    setTimeout(() => setMessage(null), 2000);
    setCustomCode('');
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage({ type: 'success', text: '已复制到剪贴板' });
      setTimeout(() => setMessage(null), 1500);
    } catch {
      setMessage({ type: 'error', text: '复制失败' });
      setTimeout(() => setMessage(null), 1500);
    }
  };

  const handleToggle = (id: string) => {
    admin.toggleRedeemCode(id);
  };

  const handleDelete = (id: string) => {
    admin.deleteRedeemCode(id);
  };

  return (
    <AdminLayout>
      <div className="h-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-6">兑换码管理</h1>

        {message && (
          <div
            className={cn(
              'flex items-center gap-2 p-4 rounded-lg mb-6',
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            )}
          >
            <Check size={18} className={message.type === 'success' ? 'text-green-400' : 'text-red-400'} />
            <p className={cn('text-sm', message.type === 'success' ? 'text-green-400' : 'text-red-400')}>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Generate Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 xl:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Gift size={20} className="text-vault-accent" />
              <h2 className="text-lg font-semibold text-white">生成兑换码</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">计划类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLAN_OPTIONS.map((plan) => (
                    <button
                      key={plan.value}
                      onClick={() => setPlanType(plan.value)}
                      className={cn(
                        'py-2 rounded-xl border-2 text-sm font-medium transition-all',
                        planType === plan.value
                          ? 'border-vault-accent bg-vault-accent/10 text-white'
                          : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                      )}
                    >
                      {plan.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">套餐天数（用户获得的订阅时长）</label>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-500" />
                  <input
                    type="number"
                    min={1}
                    value={subscriptionDays}
                    onChange={(e) => setSubscriptionDays(Number(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">使用截止日期</label>
                <input
                  type="date"
                  value={expiresDate}
                  onChange={(e) => setExpiresDate(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">总使用次数</label>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  <input
                    type="number"
                    min={1}
                    value={totalUses}
                    onChange={(e) => setTotalUses(Number(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">批量生成数量 (1-100)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  自定义兑换码 <span className="text-slate-600">(可选)</span>
                </label>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-slate-500" />
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    disabled={batchCount > 1}
                    className={cn(
                      'w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors uppercase',
                      batchCount > 1 && 'opacity-50 cursor-not-allowed'
                    )}
                    placeholder={batchCount > 1 ? '批量生成时不支持自定义' : '例如: PREMIUM2024'}
                  />
                </div>
              </div>

              <button
                className="w-full bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 transition-all"
                onClick={handleGenerate}
              >
                <Plus size={16} />
                生成兑换码
              </button>
            </div>
          </div>

          {/* Redeem Code List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tag size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-white">兑换码列表</h2>
                <span className="text-xs text-slate-500 ml-1">({filteredCodes.length})</span>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索兑换码或计划类型"
                  className="bg-slate-700/50 border border-slate-600 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors w-48 md:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-700/50">
                    <th className="pb-3 pl-3 font-medium">兑换码</th>
                    <th className="pb-3 font-medium">计划类型</th>
                    <th className="pb-3 font-medium">套餐天数</th>
                    <th className="pb-3 font-medium">使用截止日期</th>
                    <th className="pb-3 font-medium">使用次数</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 pr-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                        暂无兑换码
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((rc, index) => {
                      const status = getStatus(rc);
                      return (
                        <tr
                          key={rc.id}
                          className={cn(
                            'border-b border-slate-700/30 last:border-0',
                            index % 2 === 0 ? 'bg-slate-700/30' : 'bg-slate-700/10'
                          )}
                        >
                          <td className="py-3 pl-3">
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-white font-mono">{rc.code}</code>
                              <button
                                onClick={() => handleCopy(rc.code)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                title="复制"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                                getPlanBadge(rc.planType)
                              )}
                            >
                              {getPlanLabel(rc.planType)}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-500" />
                              {rc.subscriptionDays} 天
                            </div>
                          </td>
                          <td className="py-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-500" />
                              {new Date(rc.expiresAt).toLocaleDateString('zh-CN')}
                            </div>
                          </td>
                          <td className="py-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Users size={12} className="text-slate-500" />
                              {rc.usedCount} / {rc.totalUses}
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                                status.className
                              )}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggle(rc.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                                title={rc.enabled ? '禁用' : '启用'}
                              >
                                {rc.enabled ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                              </button>
                              <button
                                onClick={() => handleDelete(rc.id)}
                                className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="删除"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
