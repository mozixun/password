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
  Terminal,
  ShieldCheck,
  Copy,
  Fingerprint,
  Database,
  Eye,
  EyeOff,
  Archive,
  RefreshCw,
  Rocket,
  Zap,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { items, vaults, watchtower } = useStore();

  const itemCount = items.list.length;
  const vaultCount = vaults.list.length;
  const alertCount = watchtower.alerts.length;
  const securityScore = watchtower.summary.score;

  // 6 大核心功能
  const features = [
    {
      id: '01',
      icon: Lock,
      title: '端到端加密',
      desc: '采用 AES-256-GCM 加密算法，您的密码仅在本地解密，服务器无法读取任何明文数据。',
      spec: 'AES-256-GCM · PBKDF2 · HKDF',
    },
    {
      id: '02',
      icon: Fingerprint,
      title: '通行密钥 (Passkey)',
      desc: '支持 WebAuthn Passkey 标准，使用生物识别或设备 PIN 登录，彻底告别主密码。',
      spec: 'WebAuthn · FIDO2 · Touch ID',
    },
    {
      id: '03',
      icon: Smartphone,
      title: 'TOTP 验证器',
      desc: '内置二合一验证器，支持 2FA / MFA 一次性密码，保护您的所有在线账户安全。',
      spec: 'RFC 6238 · SHA1/256/512 · 30s',
    },
    {
      id: '04',
      icon: Globe,
      title: '跨平台同步',
      desc: '端到端加密同步到所有设备，支持桌面端、移动端、浏览器插件，随时随地访问。',
      spec: 'E2EE sync · zero-knowledge',
    },
    {
      id: '05',
      icon: Copy,
      title: '自动填充',
      desc: '浏览器插件自动识别登录表单，一键填充账号密码，告别手动输入与记忆。',
      spec: 'Chrome · Firefox · Safari · Edge',
    },
    {
      id: '06',
      icon: ShieldCheck,
      title: '安全审计',
      desc: '自动检测弱密码、重复密码、泄露密码，生成安全评分报告，保护您的数字资产。',
      spec: 'HIBP · 本地检测 · 零泄露',
    },
  ];

  // 技术规格
  const techSpecs = [
    { label: '加密算法', value: 'AES-256-GCM' },
    { label: '密钥派生', value: 'PBKDF2-HMAC-SHA256' },
    { label: '迭代次数', value: '700,000' },
    { label: '主密钥长度', value: '256-bit' },
    { label: '安全密钥', value: '16-byte Base32' },
    { label: '认证方式', value: 'SRP-6a / Passkey' },
    { label: 'IV 长度', value: '12-byte' },
    { label: '认证标签', value: '16-byte GCM' },
  ];

  // 工作流程（3步）
  const workflow = [
    {
      step: '01',
      title: '创建保管库',
      desc: '设置主密码与恢复密钥，系统在本地生成加密密钥对，您的数据从第一刻起就受保护。',
    },
    {
      step: '02',
      title: '添加密码',
      desc: '手动添加或从浏览器导入，所有数据在发送到服务器前已完成本地加密。',
    },
    {
      step: '03',
      title: '安全访问',
      desc: '使用主密码、Passkey 或生物识别解锁，自动填充一键登录，安全审计实时保护。',
    },
  ];

  return (
    <div className="min-h-screen bg-vault-bg">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* ===== HERO ===== */}
        <section className="mb-20">
          <div className="mb-4 text-caps text-vault-accent">
            § vaultkey / secure terminal
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-vault-text tracking-mono-tight mb-6 leading-tight">
            您的密码，
            <br />
            <span className="text-vault-accent">只有您能解锁。</span>
            <span className="inline-block w-3 h-10 md:h-14 bg-vault-accent ml-2 animate-caret-blink align-middle" aria-hidden="true" />
          </h1>
          <p className="text-log text-vault-text-secondary max-w-2xl mb-8 leading-relaxed">
            VaultKey 是一款开源、端到端加密的密码管理器。采用 AES-256-GCM + PBKDF2 加密架构，
            支持 Passkey、TOTP 验证器、自动填充与跨平台同步。您的数字身份，由您掌控。
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="vault-btn-primary flex items-center gap-2 uppercase tracking-mono-wide text-log"
              onClick={() => navigate('/items')}
            >
              <Rocket size={14} />
              立即开始
            </button>
            <button
              className="vault-btn-secondary flex items-center gap-2 uppercase tracking-mono-wide text-log"
              onClick={() => navigate('/watchtower')}
            >
              <Shield size={14} />
              安全中心
            </button>
          </div>
        </section>

        {/* ===== 实时状态面板 ===== */}
        <section className="mb-20">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-caps text-vault-text-muted">§ status</h2>
            <span className="text-hash">// live dashboard</span>
          </div>
          <div className="vault-card p-0 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-vault-border">
              <div className="p-5">
                <div className="text-3xl font-bold text-vault-accent tabular-nums mb-1">
                  {itemCount}
                </div>
                <div className="text-caps text-vault-text-muted">items</div>
              </div>
              <div className="p-5">
                <div className="text-3xl font-bold text-vault-blue tabular-nums mb-1">
                  {vaultCount}
                </div>
                <div className="text-caps text-vault-text-muted">vaults</div>
              </div>
              <div className="p-5">
                <div className="text-3xl font-bold text-vault-warn tabular-nums mb-1">
                  {alertCount}
                </div>
                <div className="text-caps text-vault-text-muted">alerts</div>
              </div>
              <div className="p-5">
                <div className="text-3xl font-bold text-vault-success tabular-nums mb-1">
                  {securityScore}%
                </div>
                <div className="text-caps text-vault-text-muted">score</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 核心功能 ===== */}
        <section className="mb-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-caps text-vault-text-muted">§ features</h2>
            <span className="text-hash">// 6 core modules</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-vault-border border border-vault-border">
            {features.map((f) => (
              <div
                key={f.id}
                className="bg-vault-card p-6 hover:bg-vault-surface transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-none border border-vault-border-strong flex items-center justify-center bg-vault-bg group-hover:border-vault-accent/40 group-hover:bg-vault-accent/10 transition-colors">
                    <f.icon size={18} className="text-vault-text-muted group-hover:text-vault-accent transition-colors" />
                  </div>
                  <span className="text-hash font-bold">{f.id}</span>
                </div>
                <h3 className="text-log font-bold text-vault-text mb-2 uppercase tracking-mono-wide">
                  {f.title}
                </h3>
                <p className="text-log text-vault-text-secondary mb-4 leading-relaxed">
                  {f.desc}
                </p>
                <div className="text-hash">
                  {f.spec}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 技术规格 ===== */}
        <section className="mb-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-caps text-vault-text-muted">§ architecture</h2>
            <span className="text-hash">// crypto stack</span>
          </div>
          <div className="vault-card p-0 overflow-hidden">
            <div className="bg-vault-surface border-b border-vault-border px-4 py-2 flex items-center gap-2">
              <Terminal size={14} className="text-vault-accent" />
              <span className="text-caps text-vault-accent">vaultkey $ specs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {techSpecs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={cn(
                    'px-4 py-3 flex items-center justify-between',
                    i % 2 === 0 ? 'sm:border-r border-vault-border' : '',
                    i < techSpecs.length - 2 ? 'border-b border-vault-border' : ''
                  )}
                >
                  <span className="text-hash">{spec.label}</span>
                  <span className="text-log font-medium text-vault-text tabular-nums">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 工作流程 ===== */}
        <section className="mb-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-caps text-vault-text-muted">§ workflow</h2>
            <span className="text-hash">// 3 simple steps</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {workflow.map((w, i) => (
              <div key={w.step} className="relative">
                <div className="vault-card p-6 h-full">
                  <div className="text-5xl font-bold text-vault-accent/20 mb-4 tracking-tighter">
                    {w.step}
                  </div>
                  <h3 className="text-log font-bold text-vault-text mb-3 uppercase tracking-mono-wide">
                    {w.title}
                  </h3>
                  <p className="text-log text-vault-text-secondary leading-relaxed">
                    {w.desc}
                  </p>
                </div>
                {i < workflow.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 items-center justify-center text-vault-text-muted z-10">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== 支持的条目类型 ===== */}
        <section className="mb-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-caps text-vault-text-muted">§ supported types</h2>
            <span className="text-hash">// all in one vault</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-vault-border border border-vault-border">
            {[
              { icon: KeyRound, label: '登录' },
              { icon: Layers, label: '信用卡' },
              { icon: Database, label: '身份' },
              { icon: Archive, label: '笔记' },
              { icon: Terminal, label: 'SSH 密钥' },
              { icon: FileKey, label: '文档' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-vault-card p-4 flex flex-col items-center justify-center gap-2 hover:bg-vault-surface transition-colors group"
              >
                <item.icon size={18} className="text-vault-text-muted group-hover:text-vault-accent transition-colors" />
                <span className="text-hash uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section>
          <div className="vault-card p-8 md:p-12 border-vault-accent/30 bg-vault-accent/[0.03]">
            <div className="text-caps text-vault-accent mb-3">§ get started</div>
            <h2 className="text-2xl md:text-3xl font-bold text-vault-text mb-4 tracking-mono-tight">
              准备好掌控您的密码了吗？
            </h2>
            <p className="text-log text-vault-text-secondary max-w-xl mb-6 leading-relaxed">
              立即开始使用 VaultKey，享受企业级加密保护。所有数据本地加密，零知识架构，
              我们永远无法访问您的密码。
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="vault-btn-primary flex items-center gap-2 uppercase tracking-mono-wide text-log"
                onClick={() => navigate('/items/new?type=login')}
              >
                <Zap size={14} />
                创建第一个密码
              </button>
              <button
                className="vault-btn-secondary flex items-center gap-2 uppercase tracking-mono-wide text-log"
                onClick={() => navigate('/generator')}
              >
                <RefreshCw size={14} />
                生成强密码
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-vault-border flex flex-wrap gap-x-6 gap-y-2 text-hash">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-vault-success" />
                端到端加密
              </span>
              <span className="flex items-center gap-1.5">
                <EyeOff size={12} className="text-vault-success" />
                零知识架构
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-vault-success" />
                安全审计
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={12} className="text-vault-success" />
                开源透明
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
