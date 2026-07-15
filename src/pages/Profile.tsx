// VaultKey 密码管理器 - 个人资料页面
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Trash2,
  LogOut,
  Shield,
  Crown,
  Check,
  Gift,
  AlertTriangle,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useProfile, useAuth, useSubscription, useStore } from '@/store';
import { cn } from '@/lib/utils';

// 设备类型图标映射
const deviceIcons: Record<string, React.ReactNode> = {
  mac: <Monitor size={18} />,
  iphone: <Smartphone size={18} />,
  ipad: <Tablet size={18} />,
  android: <Smartphone size={18} />,
  extension: <Chrome size={18} />,
  desktop: <Monitor size={18} />,
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile, devices } = useProfile();
  const { removeDevice } = useStore((s) => s.profile);
  const auth = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deviceToRevoke, setDeviceToRevoke] = useState<string | null>(null);
  const subscription = useSubscription();
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  // 计算注册日期的友好显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 计算相对时间
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return formatDate(dateStr);
  };

  const handleRedeemCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRedeemCode(value);
    if (value && !/^[A-Za-z0-9]{6,20}$/.test(value)) {
      setRedeemError('兑换码格式错误，应为6-20位字母或数字');
    } else {
      setRedeemError('');
    }
  };

  const handleRedeem = () => {
    if (!redeemCode || !/^[A-Za-z0-9]{6,20}$/.test(redeemCode)) {
      setRedeemError('请输入有效的兑换码');
      return;
    }
    const result = subscription.applyRedeemCode(redeemCode);
    if (result.success) {
      setRedeemSuccess(result.message);
      setRedeemCode('');
      setRedeemError('');
      setTimeout(() => setRedeemSuccess(''), 3000);
    } else {
      setRedeemError(result.message);
    }
  };

  // 订阅计划显示
  const planInfo = {
    free: { label: '免费版', color: 'text-vault-text-muted', icon: null },
    premium: { label: '高级版', color: 'text-vault-accent', icon: <Crown size={16} className="text-vault-accent" /> },
    family: { label: '家庭版', color: 'text-vault-purple', icon: <Crown size={16} className="text-vault-purple" /> },
    team: { label: '团队版', color: 'text-vault-blue', icon: <Shield size={16} className="text-vault-blue" /> },
  };

  const currentPlan = planInfo[profile.plan as keyof typeof planInfo] || planInfo.free;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-vault-text">个人资料</h1>
          <p className="text-vault-text-secondary mt-1">管理您的账户信息和活跃设备</p>
        </div>

        {/* 账户信息卡片 */}
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
            <User size={20} className="text-vault-accent" />
            账户信息
          </h2>

          <div className="space-y-4">
            {/* 头像和基本信息 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-vault-accent/20 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="头像"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-vault-accent">
                    {profile.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium text-vault-text">{profile.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  {currentPlan.icon}
                  <span className={cn('text-sm', currentPlan.color)}>{currentPlan.label}</span>
                </div>
              </div>
            </div>

            {/* 详细信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-vault-border/50">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">邮箱地址</div>
                  <div className="text-sm text-vault-text">{profile.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">注册日期</div>
                  <div className="text-sm text-vault-text">{formatDate(profile.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">订阅计划</div>
                  <div className={cn('text-sm flex items-center gap-1', currentPlan.color)}>
                    {currentPlan.icon}
                    {currentPlan.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">账户状态</div>
                  <div className="text-sm text-emerald-400 flex items-center gap-1">
                    <Check size={14} />
                    已验证
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 我的订阅 */}
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
            <Crown size={20} className="text-vault-accent" />
            我的订阅
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                subscription.subscription?.plan === 'premium' ? 'bg-vault-accent/20 text-vault-accent' :
                subscription.subscription?.plan === 'family' ? 'bg-purple-500/20 text-purple-400' :
                subscription.subscription?.plan === 'team' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              )}>
                {planInfo[subscription.subscription?.plan as keyof typeof planInfo]?.label || planInfo.free.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">开始日期</div>
                  <div className="text-sm text-vault-text">
                    {subscription.subscription?.startAt ? formatDate(subscription.subscription.startAt) : '-'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">到期日期</div>
                  <div className="text-sm text-vault-text">
                    {subscription.subscription?.expiresAt ? formatDate(subscription.subscription.expiresAt) : '永久有效'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">剩余天数</div>
                  <div className="text-sm text-vault-text">
                    {subscription.subscription?.expiresAt
                      ? `${Math.max(0, Math.ceil((new Date(subscription.subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} 天`
                      : '永久有效'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield size={18} className="text-vault-text-muted" />
                <div>
                  <div className="text-xs text-vault-text-muted">订阅来源</div>
                  <div className="text-sm text-vault-text">
                    {subscription.subscription?.source === 'redeemed' ? '兑换码兑换' : '直接购买'}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const remainingDays = subscription.subscription?.expiresAt
                ? Math.ceil((new Date(subscription.subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              return remainingDays !== null && remainingDays <= 7 && remainingDays >= 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400">
                  <AlertTriangle size={16} />
                  <span className="text-sm">订阅即将到期，请及时续费</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* 兑换码兑换 */}
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
            <Gift size={20} className="text-vault-accent" />
            兑换码兑换
          </h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={redeemCode}
                onChange={handleRedeemCodeChange}
                placeholder="请输入兑换码（6-20位字母或数字）"
                className="flex-1 bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-vault-text focus:outline-none focus:border-vault-accent"
                maxLength={20}
              />
              <button
                onClick={handleRedeem}
                className="bg-vault-accent text-white rounded-lg px-4 py-2"
              >
                兑换
              </button>
            </div>

            {redeemError && (
              <p className="text-sm text-red-400">{redeemError}</p>
            )}

            {redeemSuccess && (
              <p className="text-sm text-emerald-400">{redeemSuccess}</p>
            )}
          </div>
        </div>

        {/* 活跃设备卡片 */}
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-vault-accent" />
            活跃设备
          </h2>

          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  device.isCurrent
                    ? 'bg-vault-accent/5 border-vault-accent/30'
                    : 'bg-vault-surface/50 border-vault-border/50 hover:border-vault-border'
                )}
              >
                {/* 设备图标 */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  device.isCurrent ? 'bg-vault-accent/20 text-vault-accent' : 'bg-vault-hover text-vault-text-secondary'
                )}>
                  {deviceIcons[device.type] || <Monitor size={18} />}
                </div>

                {/* 设备信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-vault-text truncate">
                      {device.name}
                    </span>
                    {device.isCurrent && (
                      <span className="px-2 py-0.5 text-xs bg-vault-accent/20 text-vault-accent rounded-full">
                        当前设备
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-vault-text-muted mt-0.5">
                    最后活跃: {formatRelativeTime(device.lastActiveAt)}
                  </div>
                </div>

                {/* 注销按钮 */}
                {!device.isCurrent && (
                  <button
                    onClick={() => setDeviceToRevoke(device.id)}
                    className="p-2 rounded-lg text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
                    title="注销此设备"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {devices.length === 1 && (
            <p className="text-sm text-vault-text-muted mt-4">
              您目前只在一个设备上登录
            </p>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="vault-btn-secondary flex items-center gap-2"
          >
            <Shield size={18} />
            安全设置
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="vault-btn-secondary text-vault-warn hover:bg-vault-warn/10 flex items-center gap-2"
          >
            <LogOut size={18} />
            注销所有设备
          </button>
        </div>
      </div>

      {/* 设备注销确认弹窗 */}
      {deviceToRevoke && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold text-vault-text mb-2">注销设备</h3>
            <p className="text-sm text-vault-text-secondary mb-4">
              确定要注销此设备吗？该设备将需要重新登录才能访问保管库。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeviceToRevoke(null)}
                className="vault-btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (deviceToRevoke) {
                    removeDevice(deviceToRevoke);
                  }
                  setDeviceToRevoke(null);
                }}
                className="vault-btn-primary flex-1 bg-vault-warn hover:bg-vault-warn/80"
              >
                确认注销
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 全部注销确认弹窗 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold text-vault-text mb-2">注销所有设备</h3>
            <p className="text-sm text-vault-text-secondary mb-4">
              确定要注销所有设备吗？您需要重新登录才能访问保管库。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="vault-btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => {
                  auth.logout();
                  navigate('/auth/login');
                }}
                className="vault-btn-primary flex-1 bg-vault-warn hover:bg-vault-warn/80"
              >
                确认注销
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}