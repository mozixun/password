// VaultKey 密码管理器 - 登录/注册页面
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound, Fingerprint, Smartphone, Monitor, BookOpen } from 'lucide-react';
import useStore from '@/store';

// 登录/注册表单类型
type AuthTab = 'login' | 'register' | 'recovery';

// 检测生物识别支持
function getBiometricType(): 'touchId' | 'faceId' | 'windowsHello' | null {
  // 检测平台
  const platform = navigator.platform.toLowerCase();
  const isMac = platform.includes('mac');
  const isWindows = platform.includes('win');
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  
  // 检测 WebAuthn 支持
  if (!window.PublicKeyCredential) return null;
  
  if (isMac) return 'touchId';
  if (isIOS) return 'faceId';
  if (isWindows) return 'windowsHello';
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const auth = useStore((state) => state.auth);

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [biometricType] = useState(getBiometricType());

  // 入场动画
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 登录提交
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入主密码');
      return;
    }

    try {
      await auth.login(email, password, rememberDevice);
      navigate('/dashboard');
    } catch {
      setError('登录失败：邮箱或密码错误');
    }
  };

  // 注册提交
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password) {
      setError('请设置主密码');
      return;
    }
    if (password.length < 8) {
      setError('主密码至少需要8个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const result = await auth.register(email, password, rememberDevice);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('注册失败：该邮箱已被注册');
      }
    } catch {
      setError('注册失败，请稍后重试');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-vault-bg">
      {/* 动态渐变网格背景 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vault-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vault-accent-hover/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-vault-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      {/* 主内容卡片 */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          isAnimating
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-vault-accent to-vault-accent-dim mb-4 shadow-lg shadow-vault-accent/20">
            <Shield className="w-8 h-8 text-vault-bg" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-vault-text tracking-tight">
            VaultKey
          </h1>
          <p className="text-vault-text-secondary text-sm mt-1">
            安全、可靠的密码管理器
          </p>
        </div>

        {/* 卡片容器 */}
        <div className="glass-panel p-8 bg-vault-card/50 backdrop-blur-2xl rounded-3xl border border-vault-glass-border/20">
          {/* 标签切换 */}
          <div className="flex bg-vault-surface rounded-lg p-1 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-vault-accent text-vault-bg shadow-sm'
                  : 'text-vault-text-secondary hover:text-vault-text'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-vault-accent text-vault-bg shadow-sm'
                  : 'text-vault-text-secondary hover:text-vault-text'
              }`}
            >
              注册
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-vault-warn/10 border border-vault-warn/20 text-vault-warn text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* 登录表单 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 邮箱输入 */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  className="vault-input w-full pl-11 pr-4"
                  autoComplete="email"
                />
              </div>

              {/* 主密码输入 */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="主密码"
                  className="vault-input w-full pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* 记住设备 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-vault-border bg-vault-surface text-vault-accent focus:ring-vault-accent/30 focus:ring-offset-0"
                />
                <label htmlFor="remember" className="text-sm text-vault-text-secondary cursor-pointer select-none">
                  记住此设备
                </label>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                className="vault-btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                解锁保管库
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 邮箱输入 */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  className="vault-input w-full pl-11 pr-4"
                  autoComplete="email"
                />
              </div>

              {/* 主密码输入 */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置主密码"
                  className="vault-input w-full pl-11 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* 确认主密码 */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认主密码"
                  className="vault-input w-full pl-11 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* 记住设备 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember-reg"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-vault-border bg-vault-surface text-vault-accent focus:ring-vault-accent/30 focus:ring-offset-0"
                />
                <label htmlFor="remember-reg" className="text-sm text-vault-text-secondary cursor-pointer select-none">
                  记住此设备
                </label>
              </div>

              {/* 注册按钮 */}
              <button
                type="submit"
                className="vault-btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                创建账户
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 恢复密钥表单 */}
          {activeTab === 'recovery' && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (!recoveryKey.trim()) {
                setError('请输入恢复密钥');
                return;
              }
              if (!newPassword || newPassword.length < 8) {
                setError('新密码至少需要8个字符');
                return;
              }
              const success = await auth.unlockWithRecoveryKey(recoveryKey);
              if (success) {
                navigate('/dashboard');
              } else {
                setError('恢复密钥无效');
              }
            }} className="space-y-4">
              {/* 恢复密钥输入 */}
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="恢复密钥"
                  className="vault-input w-full pl-11 pr-4"
                  autoComplete="off"
                />
              </div>

              {/* 新密码输入 */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="设置新主密码"
                  className="vault-input w-full pl-11 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* 重置按钮 */}
              <button
                type="submit"
                className="vault-btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                重置密码
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 忘记密码链接 */}
          <div className="mt-5 text-center">
            {activeTab !== 'recovery' && (
              <button
                onClick={() => { setActiveTab('recovery'); setError(''); }}
                className="text-sm text-vault-accent hover:text-vault-accent-hover transition-colors"
              >
                忘记主密码？使用恢复密钥
              </button>
            )}
            {activeTab === 'recovery' && (
              <button
                onClick={() => { setActiveTab('login'); setError(''); }}
                className="text-sm text-vault-text-secondary hover:text-vault-text transition-colors"
              >
                返回登录
              </button>
            )}
          </div>

          {/* 生物识别提示 */}
          {biometricType && activeTab === 'login' && (
            <div className="mt-4 p-3 rounded-lg bg-vault-accent/10 border border-vault-accent/20 flex items-center gap-3">
              {biometricType === 'touchId' && <Fingerprint size={20} className="text-vault-accent" />}
              {biometricType === 'faceId' && <Smartphone size={20} className="text-vault-accent" />}
              {biometricType === 'windowsHello' && <Monitor size={20} className="text-vault-accent" />}
              <div className="text-sm text-vault-text-secondary">
                {biometricType === 'touchId' && '支持 Touch ID 快速解锁'}
                {biometricType === 'faceId' && '支持 Face ID 快速解锁'}
                {biometricType === 'windowsHello' && '支持 Windows Hello 快速解锁'}
              </div>
            </div>
          )}
        </div>

        {/* 底部安全提示 */}
        <p className="text-center text-vault-text-muted text-xs mt-6 leading-relaxed">
          您的数据经过端到端加密，我们无法读取您的主密码
        </p>

        {/* 文档链接 */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link
            to="/docs/installation"
            className="flex items-center gap-1.5 text-xs text-vault-text-muted hover:text-vault-accent transition-colors"
          >
            <BookOpen size={12} />
            <span>安装指南</span>
          </Link>
          <Link
            to="/docs/usage"
            className="flex items-center gap-1.5 text-xs text-vault-text-muted hover:text-vault-accent transition-colors"
          >
            <BookOpen size={12} />
            <span>使用指南</span>
          </Link>
          <Link
            to="/docs/security"
            className="flex items-center gap-1.5 text-xs text-vault-text-muted hover:text-vault-accent transition-colors"
          >
            <BookOpen size={12} />
            <span>安全文档</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
