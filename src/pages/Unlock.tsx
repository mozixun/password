// VaultKey 密码管理器 - 解锁保管库页面
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, LockOpen, Fingerprint, AlertTriangle, KeyRound, Clock } from 'lucide-react';
import useStore from '@/store';

export default function Unlock() {
  const navigate = useNavigate();
  const auth = useStore((state) => state.auth);
  const settings = useStore((state) => state.settings);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [recoveryKeyError, setRecoveryKeyError] = useState('');

  const maxAttempts = settings.settings.failedAttemptsBeforeLock || 5;
  const remainingAttempts = maxAttempts - auth.failedAttempts;
  const isLocked = auth.failedAttempts >= maxAttempts;

  // 如果未认证，重定向到登录页
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  // 如果已解锁，重定向到仪表盘
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLocked) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLocked, navigate]);

  // 检测信任设备，自动解锁
  useEffect(() => {
    if (auth.isAuthenticated && auth.isLocked && auth.email) {
      try {
        const storedDevice = localStorage.getItem('vaultkey-trusted-device');
        if (storedDevice) {
          const deviceData = JSON.parse(storedDevice);
          if (deviceData.email === auth.email && deviceData.deviceId) {
            setIsAnimating(true);
            setTimeout(() => {
              auth.unlockWithTrustedDevice();
              navigate('/dashboard', { replace: true });
            }, 1500);
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  // 解锁提交
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('请输入主密码');
      return;
    }

    if (isLocked) {
      setError('账户已被锁定，请使用恢复密钥解锁');
      return;
    }

    const success = auth.unlock(password);
    if (success) {
      navigate('/dashboard');
    } else {
      const newRemaining = maxAttempts - auth.failedAttempts;
      if (newRemaining <= 0) {
        setError(`主密码不正确，账户已锁定，请使用恢复密钥解锁`);
      } else {
        setError(`主密码不正确，还剩 ${newRemaining} 次尝试机会`);
      }
      setPassword('');
    }
  };

  // 使用恢复密钥解锁
  const handleRecoveryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryKeyError('');

    if (!recoveryKeyInput.trim()) {
      setRecoveryKeyError('请输入恢复密钥');
      return;
    }

    const success = auth.unlockWithRecoveryKey(recoveryKeyInput);
    if (success) {
      navigate('/dashboard');
    } else {
      setRecoveryKeyError('恢复密钥不正确');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-vault-bg">
      {/* CSS 粒子动画背景 */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              opacity: 0.15 + Math.random() * 0.2,
            }}
          />
        ))}
      </div>

      {/* 主内容卡片 */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 transition-all duration-700 ease-out ${
          isAnimating
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-vault-accent to-vault-accent-dim mb-4 shadow-lg shadow-vault-accent/20">
            <Shield className="w-6 h-6 text-vault-bg" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-vault-text tracking-tight">
            VaultKey
          </h1>
        </div>

        {/* 卡片容器 */}
        <div className="vault-card p-8 bg-vault-card/80 backdrop-blur-xl">
          {/* 标题 */}
          <h2 className="text-lg font-semibold text-vault-text text-center mb-6">
            {isLocked ? '账户已锁定' : '输入主密码以解锁'}
          </h2>

          {/* 用户邮箱提示 */}
          {auth.email && (
            <div className="mb-5 px-4 py-2.5 rounded-lg bg-vault-surface border border-vault-border text-center">
              <span className="text-sm text-vault-text-secondary">{auth.email}</span>
            </div>
          )}

          {/* 锁定状态提示 */}
          {isLocked && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-vault-warn/10 border border-vault-warn/20 flex items-center gap-3">
              <AlertTriangle size={18} className="text-vault-warn shrink-0" />
              <div>
                <p className="text-sm text-vault-warn font-medium">账户已被锁定</p>
                <p className="text-xs text-vault-text-secondary">请使用恢复密钥解锁或稍后重试</p>
              </div>
            </div>
          )}

          {/* 错误次数提示 */}
          {!isLocked && auth.failedAttempts > 0 && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-vault-orange/10 border border-vault-orange/20 flex items-center gap-2">
              <Clock size={14} className="text-vault-orange" />
              <span className="text-sm text-vault-orange">
                还剩 <strong>{remainingAttempts}</strong> 次尝试机会
              </span>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-vault-warn/10 border border-vault-warn/20 text-vault-warn text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* 恢复密钥解锁表单 */}
          {showRecoveryKey ? (
            <form onSubmit={handleRecoveryUnlock} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-vault-text-muted" />
                <input
                  type="text"
                  value={recoveryKeyInput}
                  onChange={(e) => { setRecoveryKeyInput(e.target.value); setRecoveryKeyError(''); }}
                  placeholder="输入恢复密钥"
                  className="vault-input w-full pl-11"
                  autoFocus
                />
              </div>
              {recoveryKeyError && (
                <div className="px-4 py-2 rounded-lg bg-vault-warn/10 text-vault-warn text-sm">
                  {recoveryKeyError}
                </div>
              )}
              <button
                type="submit"
                className="vault-btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
              >
                <KeyRound className="w-4.5 h-4.5" />
                使用恢复密钥解锁
              </button>
              <button
                type="button"
                onClick={() => { setShowRecoveryKey(false); setRecoveryKeyInput(''); setRecoveryKeyError(''); }}
                className="vault-btn-secondary w-full py-2 text-sm"
              >
                返回主密码解锁
              </button>
            </form>
          ) : (
            /* 主密码解锁表单 */
            <form onSubmit={handleUnlock} className="space-y-4">
              {/* 主密码输入 */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="主密码"
                  className="vault-input w-full pr-11 text-center text-lg tracking-widest"
                  autoComplete="current-password"
                  autoFocus
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* 解锁按钮 */}
              <button
                type="submit"
                className="vault-btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                disabled={isLocked}
              >
                <LockOpen className="w-4.5 h-4.5" />
                解锁
              </button>

              {/* Touch ID 按钮 */}
              <button
                type="button"
                onClick={async () => {
                  // 尝试使用平台生物识别（WebAuthn）
                  if (window.PublicKeyCredential) {
                    try {
                      // 检查平台认证器是否可用
                      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                      if (available && auth.isAuthenticated) {
                        // 使用生物识别解锁：需要用户已在当前设备验证过
                        // 这里仅作为快捷解锁，仍需验证身份
                        setError('请输入主密码以继续，或使用恢复密钥');
                        return;
                      }
                    } catch {
                      // 生物识别不可用
                    }
                  }
                  setError('当前设备不支持生物识别，请输入主密码');
                }}
                className="vault-btn-secondary w-full flex items-center justify-center gap-2 py-3"
                disabled={isLocked}
              >
                <Fingerprint className="w-4.5 h-4.5" />
                使用 Touch ID 解锁
              </button>
            </form>
          )}

          {/* 恢复密钥链接 */}
          {!showRecoveryKey && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowRecoveryKey(true)}
                className="text-sm text-vault-accent hover:text-vault-accent-hover transition-colors"
              >
                {isLocked ? '使用恢复密钥解锁' : '忘记主密码？使用恢复密钥'}
              </button>
            </div>
          )}

          {/* 返回登录链接 */}
          {!showRecoveryKey && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="text-xs text-vault-text-muted hover:text-vault-text-secondary transition-colors"
              >
                返回登录页面
              </button>
            </div>
          )}
        </div>

        {/* 底部安全提示 */}
        <p className="text-center text-vault-text-muted text-xs mt-6 leading-relaxed">
          您的数据经过端到端加密，我们无法读取您的主密码
        </p>
      </div>

      {/* 粒子动画样式 */}
      <style>{`
        .particles-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: #00D4AA;
          animation: particleFloat ease-in-out infinite;
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: var(--particle-opacity, 0.2);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-30px) translateX(-5px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-15px) translateX(8px);
          }
        }
      `}</style>
    </div>
  );
}
