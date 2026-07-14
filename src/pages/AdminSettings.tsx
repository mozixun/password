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
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useAdmin } from '@/store';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const admin = useAdmin();
  const { siteInfo, domainConfig } = admin.settings;

  const [siteName, setSiteName] = useState(siteInfo.name);
  const [logoUrl, setLogoUrl] = useState(siteInfo.logoUrl);
  const [description, setDescription] = useState(siteInfo.description);

  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [matchMode, setMatchMode] = useState<'exact' | 'fuzzy'>(domainConfig.matchMode);

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

  return (
    <AppLayout>
      <div className="h-full animate-fade-in">
        <h1 className="text-2xl font-bold text-vault-text mb-6">管理员设置</h1>

        {saveMessage && (
          <div
            className={cn(
              'flex items-center gap-2 p-4 rounded-lg mb-6',
              saveMessage.type === 'success'
                ? 'bg-vault-success/10 border border-vault-success/20'
                : 'bg-vault-error/10 border border-vault-error/20'
            )}
          >
            <Check size={18} className={saveMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error'} />
            <p className={cn('text-sm', saveMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error')}>
              {saveMessage.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 网站信息配置 */}
          <div className="vault-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={20} className="text-vault-accent" />
              <h2 className="text-lg font-semibold text-vault-text">网站信息</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">网站名称</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="vault-input w-full"
                  placeholder="输入网站名称"
                />
              </div>

              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="vault-input w-full"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">网站描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="vault-input w-full resize-none"
                  rows={3}
                  placeholder="输入网站描述"
                />
              </div>

              <button
                className="vault-btn-primary text-sm flex items-center gap-1.5"
                onClick={handleSaveSiteInfo}
              >
                <Save size={16} />
                保存网站信息
              </button>
            </div>
          </div>

          {/* 域名配置 */}
          <div className="space-y-6">
            {/* 域名允许列表 */}
            <div className="vault-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-vault-text">域名允许列表</h2>
              </div>

              <p className="text-xs text-vault-text-muted mb-4">
                在此列表中的域名将允许自动填充密码。支持通配符格式如 *.example.com
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newAllowedDomain}
                  onChange={(e) => setNewAllowedDomain(e.target.value)}
                  className="vault-input flex-1"
                  placeholder="添加域名"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowedDomain()}
                />
                <button
                  className="vault-btn-secondary text-sm flex items-center gap-1"
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
                    className="flex items-center justify-between p-3 bg-vault-surface border border-vault-border rounded-lg"
                  >
                    <span className="text-sm text-vault-text">{domain}</span>
                    <button
                      className="text-vault-warn hover:text-vault-warn/80 transition-colors p-1 hover:bg-vault-warn/10 rounded"
                      onClick={() => handleRemoveAllowedDomain(domain)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 域名阻止列表 */}
            <div className="vault-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-vault-warn" />
                <h2 className="text-lg font-semibold text-vault-text">域名阻止列表</h2>
              </div>

              <p className="text-xs text-vault-text-muted mb-4">
                在此列表中的域名将被阻止自动填充密码，提高安全性
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newBlockedDomain}
                  onChange={(e) => setNewBlockedDomain(e.target.value)}
                  className="vault-input flex-1"
                  placeholder="添加域名"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBlockedDomain()}
                />
                <button
                  className="vault-btn-secondary text-sm flex items-center gap-1"
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
                    className="flex items-center justify-between p-3 bg-vault-surface border border-vault-border rounded-lg"
                  >
                    <span className="text-sm text-vault-text">{domain}</span>
                    <button
                      className="text-vault-warn hover:text-vault-warn/80 transition-colors p-1 hover:bg-vault-warn/10 rounded"
                      onClick={() => handleRemoveBlockedDomain(domain)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 自动填充匹配规则 */}
            <div className="vault-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw size={20} className="text-vault-accent" />
                <h2 className="text-lg font-semibold text-vault-text">自动填充匹配规则</h2>
              </div>

              <p className="text-xs text-vault-text-muted mb-4">
                设置自动填充时域名匹配的方式
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    matchMode === 'exact'
                      ? 'border-vault-accent bg-vault-accent/5'
                      : 'border-vault-border bg-vault-surface hover:border-vault-accent/30'
                  )}
                  onClick={() => handleSetMatchMode('exact')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-vault-text">精确匹配</span>
                    {matchMode === 'exact' && (
                      <Check size={16} className="text-vault-accent" />
                    )}
                  </div>
                  <p className="text-xs text-vault-text-muted">
                    仅当域名完全匹配时才自动填充
                  </p>
                </button>

                <button
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    matchMode === 'fuzzy'
                      ? 'border-vault-accent bg-vault-accent/5'
                      : 'border-vault-border bg-vault-surface hover:border-vault-accent/30'
                  )}
                  onClick={() => handleSetMatchMode('fuzzy')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-vault-text">模糊匹配</span>
                    {matchMode === 'fuzzy' && (
                      <Check size={16} className="text-vault-accent" />
                    )}
                  </div>
                  <p className="text-xs text-vault-text-muted">
                    域名包含匹配时即自动填充（更便捷）
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}