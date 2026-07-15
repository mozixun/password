import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim()) {
      setError('请输入用户名');
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError('请输入密码');
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'vaultkey-admin-token-' + Date.now());
      navigate('/admin/dashboard');
    } else {
      setError('用户名或密码错误');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vault-accent/10 via-transparent to-transparent" />

      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
          isAnimating
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-vault-accent to-vault-accent-dim mb-4 shadow-lg shadow-vault-accent/30">
            <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            VaultKey
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            管理员后台
          </p>
        </div>

        <div className="glass-panel p-8 bg-slate-800/50 backdrop-blur-2xl rounded-3xl border border-slate-700/30">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="管理员用户名"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-11 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent focus:ring-1 focus:ring-vault-accent transition-all"
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理员密码"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-11 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent focus:ring-1 focus:ring-vault-accent transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  登录管理后台
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              默认管理员账户：admin / admin123
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          管理员专用入口，用户请访问前台页面
        </p>
      </div>
    </div>
  );
}
