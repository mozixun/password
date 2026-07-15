// VaultKey 密码管理器 - 仪表盘页面
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Copy,
  ShieldAlert,
  Plus,
  CheckCircle,
  ArrowRight,
  CreditCard,
  FileText,
  KeyRound,
  Smartphone,
  Shield,
  Database,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import SecurityScore from '@/components/SecurityScore';
import ItemCard from '@/components/ItemCard';
import { useWatchtower, useItems, useProfile } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import type { ItemType } from '@/types';

// 严重程度对应的颜色和图标
function getSeverityStyle(severity: 'high' | 'medium' | 'low') {
  switch (severity) {
    case 'high':
      return { icon: <ShieldAlert size={18} />, color: 'text-vault-warn', bg: 'bg-vault-warn/15' };
    case 'medium':
      return { icon: <AlertTriangle size={18} />, color: 'text-vault-orange', bg: 'bg-vault-orange/15' };
    case 'low':
      return { icon: <AlertTriangle size={18} />, color: 'text-vault-blue', bg: 'bg-vault-blue/15' };
  }
}

// 类型统计配置
const typeStats: { type: ItemType; label: string; icon: typeof Plus; color: string; bg: string }[] = [
  { type: 'login', label: '登录', icon: KeyRound, color: 'text-vault-accent', bg: 'bg-vault-accent/15' },
  { type: 'credit_card', label: '信用卡', icon: CreditCard, color: 'text-vault-purple', bg: 'bg-vault-purple/15' },
  { type: 'note', label: '笔记', icon: FileText, color: 'text-vault-green', bg: 'bg-vault-green/15' },
  { type: 'totp_authenticator', label: '验证器', icon: Smartphone, color: 'text-vault-blue', bg: 'bg-vault-blue/15' },
  { type: 'passkey', label: '通行密钥', icon: Shield, color: 'text-vault-orange', bg: 'bg-vault-orange/15' },
  { type: 'ssh_key', label: 'SSH密钥', icon: Database, color: 'text-vault-pink', bg: 'bg-vault-pink/15' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { summary, alerts } = useWatchtower();
  const { list: items } = useItems();
  const { profile } = useProfile();
  const { t } = useTranslation();

  // 获取最近使用的5个条目（按更新时间排序）
  const recentItems = [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // 按类型统计
  const statsByType = typeStats.map((config) => ({
    ...config,
    count: items.filter((item) => item.type === config.type).length,
  }));

  // 当前日期格式化
  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* 欢迎头部 */}
        <div className="animate-slide-up mb-8">
          <h1 className="text-2xl font-display font-bold text-vault-text">
            {t.dashboard.welcomeBack}
          </h1>
          <p className="text-vault-text-secondary mt-1">
            {profile.email} · {currentDate}
          </p>
        </div>

        {/* 两栏网格：安全评分 + 快捷操作 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 左侧：安全评分区域 */}
          <div
            className="animate-slide-up vault-card p-6"
            style={{ animationDelay: '0.05s' }}
          >
            <h2 className="text-sm font-medium text-vault-text-secondary mb-4">
            {t.dashboard.securityScore}
          </h2>
            <SecurityScore score={summary.score} />

            {/* 三个统计卡片 */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {/* 弱密码 */}
              <div className="vault-card p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-vault-orange/15 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle size={16} className="text-vault-orange" />
                </div>
                <div className="text-lg font-bold text-vault-text">{summary.weakPasswords}</div>
                <div className="text-xs text-vault-text-muted">{t.dashboard.weakPasswords}</div>
              </div>

              {/* 重复密码 */}
              <div className="vault-card p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-vault-blue/15 flex items-center justify-center mx-auto mb-2">
                  <Copy size={16} className="text-vault-blue" />
                </div>
                <div className="text-lg font-bold text-vault-text">{summary.reusedPasswords}</div>
                <div className="text-xs text-vault-text-muted">{t.dashboard.reusedPasswords}</div>
              </div>

              {/* 已泄露 */}
              <div className="vault-card p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-vault-warn/15 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert size={16} className="text-vault-warn" />
                </div>
                <div className="text-lg font-bold text-vault-text">{summary.compromisedPasswords}</div>
                <div className="text-xs text-vault-text-muted">{t.dashboard.compromisedPasswords}</div>
              </div>
            </div>

            {/* 查看安全中心链接 */}
            <button
            onClick={() => navigate('/watchtower')}
            className="mt-4 flex items-center gap-1.5 text-sm text-vault-accent hover:text-vault-accent-hover transition-colors w-full justify-center"
          >
            {t.dashboard.viewSecurityCenter}
            <ArrowRight size={14} />
          </button>
          </div>

          {/* 右侧：类型统计 */}
          <div
            className="animate-slide-up vault-card p-6"
            style={{ animationDelay: '0.1s' }}
          >
            <h2 className="text-sm font-medium text-vault-text-secondary mb-4">
            {t.dashboard.typeStats}
          </h2>
            <div className="grid grid-cols-3 gap-3">
              {statsByType.map((stat) => (
                <button
                  key={stat.type}
                  onClick={() => navigate(`/items?type=${stat.type}`)}
                  className="vault-card p-3 flex flex-col items-center gap-2 hover:border-vault-accent/30 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <div className="text-lg font-bold text-vault-text">{stat.count}</div>
                  <div className="text-xs text-vault-text-muted">{stat.label}</div>
                </button>
              ))}
            </div>

            {/* 总条目数 */}
            <div className="mt-4 pt-4 border-t border-vault-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-vault-text-secondary">{t.dashboard.totalItems}</span>
                <span className="text-xl font-bold text-vault-accent">{items.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div
          className="animate-slide-up vault-card p-6 mb-8"
          style={{ animationDelay: '0.12s' }}
        >
          <h2 className="text-sm font-medium text-vault-text-secondary mb-4">
            {t.dashboard.quickActions}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: t.dashboard.newLogin, type: 'login', bg: 'bg-vault-accent/15', borderHover: 'hover:border-vault-accent/50', text: 'text-vault-accent', bgHover: 'group-hover:bg-vault-accent/25' },
              { label: t.dashboard.newCard, type: 'credit_card', bg: 'bg-vault-purple/15', borderHover: 'hover:border-vault-purple/50', text: 'text-vault-purple', bgHover: 'group-hover:bg-vault-purple/25' },
              { label: t.dashboard.newNote, type: 'note', bg: 'bg-vault-green/15', borderHover: 'hover:border-vault-green/50', text: 'text-vault-green', bgHover: 'group-hover:bg-vault-green/25' },
              { label: t.dashboard.newAuthenticator, type: 'totp_authenticator', bg: 'bg-vault-blue/15', borderHover: 'hover:border-vault-blue/50', text: 'text-vault-blue', bgHover: 'group-hover:bg-vault-blue/25' },
              { label: t.dashboard.newPasskey, type: 'passkey', bg: 'bg-vault-orange/15', borderHover: 'hover:border-vault-orange/50', text: 'text-vault-orange', bgHover: 'group-hover:bg-vault-orange/25' },
              { label: t.sidebar.passwordGenerator, path: '/generator', bg: 'bg-vault-pink/15', borderHover: 'hover:border-vault-pink/50', text: 'text-vault-pink', bgHover: 'group-hover:bg-vault-pink/25' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path || (action.type ? `/items/new?type=${action.type}` : '/items/new'))}
                className={`vault-card p-3 flex flex-col items-center gap-2 ${action.borderHover} transition-colors group`}
              >
                <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center ${action.bgHover} transition-colors`}>
                  <Plus size={18} className={action.text} />
                </div>
                <span className="text-xs font-medium text-vault-text">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 最近使用 */}
        <div
          className="animate-slide-up mb-8"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-vault-text">
              {t.dashboard.recentItems}
            </h2>
            <button
              onClick={() => navigate('/items')}
              className="text-sm text-vault-accent hover:text-vault-accent-hover transition-colors flex items-center gap-1"
            >
              {t.dashboard.viewAll}
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div key={item.id} className="min-w-[240px] max-w-[280px]">
                  <ItemCard item={item} />
                </div>
              ))
            ) : (
              /* 无条目时显示引导卡片 */
              <div
                className="vault-card p-6 flex flex-col items-center justify-center text-center min-w-[240px]"
              >
                <div className="w-12 h-12 rounded-xl bg-vault-accent/15 flex items-center justify-center mb-3">
                  <Plus size={24} className="text-vault-accent" />
                </div>
                <p className="text-sm text-vault-text-secondary mb-3">
                  {t.dashboard.noPasswords}
                </p>
                <button
                  onClick={() => navigate('/items/new?type=login')}
                  className="vault-btn-primary text-sm py-1.5 px-4"
                >
                  {t.dashboard.addFirstPassword}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 安全提醒 */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className="text-lg font-display font-bold text-vault-text mb-4">
            {t.dashboard.securityAlerts}
          </h2>

          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const severityStyle = getSeverityStyle(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className="vault-card p-4 flex items-center gap-4"
                  >
                    {/* 严重程度图标 */}
                    <div className={`w-9 h-9 rounded-lg ${severityStyle.bg} flex items-center justify-center shrink-0`}>
                      <span className={severityStyle.color}>{severityStyle.icon}</span>
                    </div>

                    {/* 提醒描述 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-vault-text">
                          {alert.itemTitle}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${severityStyle.bg} ${severityStyle.color}`}>
                          {alert.severity === 'high' ? t.dashboard.highRisk : alert.severity === 'medium' ? t.dashboard.mediumRisk : t.dashboard.lowRisk}
                        </span>
                      </div>
                      <p className="text-xs text-vault-text-secondary mt-0.5 truncate">
                        {alert.description}
                      </p>
                    </div>

                    {/* 修复按钮 */}
                    <button
                      onClick={() => navigate(`/items/detail/${alert.itemId}`)}
                      className="vault-btn-primary text-xs py-1.5 px-3 shrink-0"
                    >
                      {t.dashboard.fix}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 无提醒时显示安全状态 */
            <div className="vault-card p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-vault-accent/15 flex items-center justify-center shrink-0">
                <CheckCircle size={22} className="text-vault-accent" />
              </div>
              <p className="text-sm font-medium text-vault-accent">
                {t.dashboard.allPasswordsSecure}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
