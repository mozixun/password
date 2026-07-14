import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import {
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Globe,
  FileKey,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { items, vaults, watchtower } = useStore();

  const itemCount = items.list.length;
  const vaultCount = vaults.list.length;
  const alertCount = watchtower.alerts.length;
  const securityScore = watchtower.summary.score;

  const features = [
    {
      icon: Lock,
      title: '端到端加密',
      desc: '采用 AES-256-GCM 加密算法，只有您能访问您的数据',
      color: 'text-vault-accent',
    },
    {
      icon: KeyRound,
      title: '通行密钥',
      desc: '支持 Passkey 标准，告别密码，使用生物识别登录',
      color: 'text-vault-purple',
    },
    {
      icon: Shield,
      title: 'TOTP 验证器',
      desc: '内置二合一验证器，保护您的所有在线账户',
      color: 'text-vault-green',
    },
    {
      icon: Globe,
      title: '跨平台同步',
      desc: '数据安全同步到所有设备，随时随地访问密码',
      color: 'text-vault-blue',
    },
    {
      icon: Smartphone,
      title: '自动填充',
      desc: '浏览器插件自动填充登录信息，一键登录',
      color: 'text-vault-orange',
    },
    {
      icon: FileKey,
      title: '安全审计',
      desc: '检测弱密码和重复密码，保护您的数字资产',
      color: 'text-vault-pink',
    },
  ];

  const quickActions = [
    { label: '新建登录', icon: Plus, path: '/items/new?type=login' },
    { label: '新建卡片', icon: Plus, path: '/items/new?type=credit_card' },
    { label: '新建笔记', icon: Plus, path: '/items/new?type=note' },
    { label: '新建验证器', icon: Plus, path: '/items/new?type=totp_authenticator' },
  ];

  return (
    <div className="min-h-screen bg-vault-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero 区域 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-vault-accent/10 mb-6">
            <Lock className="w-10 h-10 text-vault-accent" />
          </div>
          <h1 className="text-4xl font-bold text-vault-text mb-4">欢迎使用 VaultKey</h1>
          <p className="text-lg text-vault-text-secondary max-w-2xl mx-auto">
            您的专属密码管家，安全存储、自动填充、跨平台同步。
            <br />
            让密码管理变得简单而安全。
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="vault-card p-6 text-center">
            <div className="text-3xl font-bold text-vault-accent mb-1">{itemCount}</div>
            <div className="text-sm text-vault-text-secondary">密码条目</div>
          </div>
          <div className="vault-card p-6 text-center">
            <div className="text-3xl font-bold text-vault-purple mb-1">{vaultCount}</div>
            <div className="text-sm text-vault-text-secondary">保险库</div>
          </div>
          <div className="vault-card p-6 text-center">
            <div className="text-3xl font-bold text-vault-green mb-1">{alertCount}</div>
            <div className="text-sm text-vault-text-secondary">安全风险</div>
          </div>
          <div className="vault-card p-6 text-center">
            <div className="text-3xl font-bold text-vault-blue mb-1">{securityScore}%</div>
            <div className="text-sm text-vault-text-secondary">加密保护</div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="vault-card p-6 mb-12">
          <h2 className="text-lg font-semibold text-vault-text mb-4">快速创建</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-vault-surface hover:bg-vault-hover border border-vault-border transition-all duration-200"
              >
                <action.icon size={16} className="text-vault-accent" />
                <span className="text-sm text-vault-text-secondary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 功能特性 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="vault-card p-6 hover:shadow-lg hover:shadow-vault-accent/5 transition-all duration-300"
            >
              <feature.icon className={cn('w-8 h-8 mb-4', feature.color)} />
              <h3 className="text-lg font-semibold text-vault-text mb-2">{feature.title}</h3>
              <p className="text-sm text-vault-text-secondary">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 最近使用 */}
        {itemCount > 0 && (
          <div className="vault-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-vault-text">最近使用</h2>
              <button
                onClick={() => navigate('/items')}
                className="flex items-center gap-1 text-sm text-vault-accent hover:text-vault-accent/80 transition-colors"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {items.list.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-vault-hover transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-vault-accent/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-vault-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vault-text truncate">{item.title}</p>
                    <p className="text-xs text-vault-text-muted truncate">{item.url || item.username}</p>
                  </div>
                  <ChevronRight size={16} className="text-vault-text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {itemCount === 0 && (
          <div className="vault-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vault-accent/10 mb-4">
              <Lock className="w-8 h-8 text-vault-accent" />
            </div>
            <h3 className="text-lg font-semibold text-vault-text mb-2">开始您的密码之旅</h3>
            <p className="text-sm text-vault-text-secondary mb-6">
              还没有任何密码条目，点击下方按钮创建您的第一个密码
            </p>
            <button
              onClick={() => navigate('/items/new?type=login')}
              className="vault-btn-primary"
            >
              创建第一个密码
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
