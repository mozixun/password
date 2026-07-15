import { useState } from 'react';
import {
  Globe,
  Shield,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  Mail,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAdmin } from '@/store';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const admin = useAdmin();
  const { siteInfo, domainConfig, notificationConfig } = admin.settings;

  const [siteName, setSiteName] = useState(siteInfo.name);
  const [logoUrl, setLogoUrl] = useState(siteInfo.logoUrl);
  const [description, setDescription] = useState(siteInfo.description);

  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [matchMode, setMatchMode] = useState<'exact' | 'fuzzy'>(domainConfig.matchMode);

  const [smtpHost, setSmtpHost] = useState(notificationConfig?.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(notificationConfig?.smtpPort || 587);
  const [senderEmail, setSenderEmail] = useState(notificationConfig?.senderEmail || '');
  const [senderName, setSenderName] = useState(notificationConfig?.senderName || '');
  const [notifyEnabled, setNotifyEnabled] = useState(notificationConfig?.enabled || false);

  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSiteInfo = () => {
    admin.updateSiteInfo({ name: siteName, logoUrl, description });
    setSaveMessage({ type: 'success', text: '网站信息保存成功' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleAddAllowedDomain = () => {
    if (!newAllowedDomain.trim()) return;
    admin.addAllowedDomain(newAllowedDomain.trim());
    setNewAllowedDomain('');
    setSaveMessage({ type: 'success', text: '域名已添加到允许列表' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleRemoveAllowedDomain = (domain: string) => {
    admin.removeAllowedDomain(domain);
    setSaveMessage({ type: 'success', text: '域名已从允许列表移除' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleAddBlockedDomain = () => {
    if (!newBlockedDomain.trim()) return;
    admin.addBlockedDomain(newBlockedDomain.trim());
    setNewBlockedDomain('');
    setSaveMessage({ type: 'success', text: '域名已添加到阻止列表' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleRemoveBlockedDomain = (domain: string) => {
    admin.removeBlockedDomain(domain);
    setSaveMessage({ type: 'success', text: '域名已从阻止列表移除' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleSetMatchMode = (mode: 'exact' | 'fuzzy') => {
    setMatchMode(mode);
    admin.setMatchMode(mode);
    setSaveMessage({ type: 'success', text: `匹配模式已切换为${mode === 'exact' ? '精确匹配' : '模糊匹配'}` });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleSaveNotificationConfig = () => {
    admin.updateNotificationConfig({ smtpHost, smtpPort, senderEmail, senderName, enabled: notifyEnabled });
    setSaveMessage({ type: 'success', text: '通知邮箱配置保存成功' });
    setTimeout(() => setSaveMessage(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="h-full animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-6">系统设置</h1>

        {saveMessage && (
          <div
            className={cn(
              'flex items-center gap-2 p-4 rounded-lg mb-6',
              saveMessage.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            )}
          >
            <Check size={18} className={saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'} />
            <p className={cn('text-sm', saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400')}>
              {saveMessage.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={20} className="text-vault-accent" />
              <h2 className="text-lg font-semibold text-white">网站信息</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">网站名称</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  placeholder="输入网站名称"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">网站描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors resize-none"
                  rows={3}
                  placeholder="输入网站描述"
                />
              </div>

              <button
                className="bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-all"
                onClick={handleSaveSiteInfo}
              >
                <Save size={16} />
                保存网站信息
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-white">域名允许列表</h2>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                在此列表中的域名将允许自动填充密码。支持通配符格式如 *.example.com
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newAllowedDomain}
                  onChange={(e) => setNewAllowedDomain(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  placeholder="添加域名"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowedDomain()}
                />
                <button
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-1 transition-colors"
                  onClick={handleAddAllowedDomain}
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {domainConfig.allowedDomains.map((domain) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <span className="text-sm text-white">{domain}</span>
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                      onClick={() => handleRemoveAllowedDomain(domain)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">域名阻止列表</h2>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                在此列表中的域名将被阻止自动填充密码，提高安全性
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newBlockedDomain}
                  onChange={(e) => setNewBlockedDomain(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                  placeholder="添加域名"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBlockedDomain()}
                />
                <button
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-1 transition-colors"
                  onClick={handleAddBlockedDomain}
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {domainConfig.blockedDomains.map((domain) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <span className="text-sm text-white">{domain}</span>
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                      onClick={() => handleRemoveBlockedDomain(domain)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-white">自动填充匹配规则</h2>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                设置自动填充时域名匹配的方式
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    matchMode === 'exact'
                      ? 'border-vault-accent bg-vault-accent/5'
                      : 'border-slate-600 bg-slate-700/30 hover:border-vault-accent/30'
                  )}
                  onClick={() => handleSetMatchMode('exact')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">精确匹配</span>
                    {matchMode === 'exact' && (
                      <Check size={16} className="text-vault-accent" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    仅当域名完全匹配时才自动填充
                  </p>
                </button>

                <button
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    matchMode === 'fuzzy'
                      ? 'border-vault-accent bg-vault-accent/5'
                      : 'border-slate-600 bg-slate-700/30 hover:border-vault-accent/30'
                  )}
                  onClick={() => handleSetMatchMode('fuzzy')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">模糊匹配</span>
                    {matchMode === 'fuzzy' && (
                      <Check size={16} className="text-vault-accent" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    域名包含匹配时即自动填充（更便捷）
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-white">通知邮箱配置</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">SMTP 服务器</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">SMTP 端口</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">发件人邮箱</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                    placeholder="noreply@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">发件人名称</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
                    placeholder="Vault 系统"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="block text-sm text-slate-400">启用邮件通知</label>
                  <button
                    onClick={() => setNotifyEnabled(!notifyEnabled)}
                    className={cn(
                      'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                      notifyEnabled ? 'bg-green-500' : 'bg-red-500'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                        notifyEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <button
                  className="bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-all"
                  onClick={handleSaveNotificationConfig}
                >
                  <Save size={16} />
                  保存通知配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
