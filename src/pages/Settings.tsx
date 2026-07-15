// VaultKey 密码管理器 - 设置页面
import { useState, useEffect } from 'react';
import {
  Shield,
  Palette,
  Import,
  Globe,
  Info,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  KeyRound,
  Monitor,
  Sun,
  Moon,
  Upload,
  Download,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  HardDriveDownload,
  RotateCcw,
  History,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore, useUI } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { getLanguageName } from '@/i18n';
import { cn } from '@/lib/utils';
import { persistClipboardSettings } from '@/utils/clipboard';
import { importData, exportToCSV, exportToJSON, exportTo1PasswordCSV } from '@/utils/importExport';
import {
  createBackup,
  getBackups,
  saveBackup,
  deleteBackup,
  clearAllBackups,
  downloadBackup,
  formatBackupTime,
  type BackupSnapshot,
} from '@/utils/backup';
import type { VaultItem } from '@/types';

// 设置侧边栏项目类型
type SettingsSection = 'account' | 'security' | 'appearance' | 'importExport' | 'backup' | 'language' | 'about';

// 语言选项
const languages: { value: 'zh' | 'en'; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
];

export default function Settings() {
  const { ui, profile, settings, vaults, items: itemsStore } = useStore();
  const { t, language } = useTranslation();
  const { setLanguage } = useUI();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  const settingsSections: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
    { key: 'account', label: t.settings.accountSecurity, icon: Shield },
    { key: 'security', label: t.settings.securitySettings, icon: Lock },
    { key: 'appearance', label: t.settings.appearance, icon: Palette },
    { key: 'importExport', label: t.settings.importExport, icon: Import },
    { key: 'backup', label: '备份与恢复', icon: HardDriveDownload },
    { key: 'language', label: t.settings.language, icon: Globe },
    { key: 'about', label: t.settings.about, icon: Info },
  ];

  const importFormats = ['1Password', 'Bitwarden', 'LastPass', 'KeePass', 'CSV'];
  const exportFormats = ['CSV', 'JSON', '1PIF'];

  // ====== 账户安全状态 ======
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [recoveryKey] = useState('VK-R3C0V-ERYK-EY20-24XX-ZZ9K');
  const [recoveryKeyCopied, setRecoveryKeyCopied] = useState(false);

  // ====== 安全设置状态 ======
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.settings.autoLockMinutes);
  const [clipboardClearSeconds, setClipboardClearSeconds] = useState(settings.settings.clipboardClearSeconds);
  const [travelModeEnabled, setTravelModeEnabled] = useState(settings.settings.travelModeEnabled);
  const [failedAttemptsBeforeLock] = useState(settings.settings.failedAttemptsBeforeLock);
  const [lockOnScreenLock] = useState(true);

  // ====== 紧急访问状态 ======
  const [showAddEmergencyContact, setShowAddEmergencyContact] = useState(false);
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emergencyAccessLevel, setEmergencyAccessLevel] = useState<'view' | 'edit' | 'full'>('view');
  const [emergencyWaitPeriod, setEmergencyWaitPeriod] = useState(24);
  const [emergencyApprovalRequired, setEmergencyApprovalRequired] = useState(true);

  // ====== 外观主题状态 ======
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>(ui.theme);

  // ====== 导入导出状态 ======
  const [importFormat, setImportFormat] = useState('1Password');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const [lastImportDate, setLastImportDate] = useState('2025-06-15 14:30');
  const [lastExportDate, setLastExportDate] = useState('2025-07-01 09:00');
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  // ====== 语言设置状态 ======
  const selectedLanguage = language;

  // ====== 备份状态 ======
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载备份列表
  const refreshBackups = () => setBackups(getBackups());

  // 切换到备份页面时加载备份数据
  useEffect(() => {
    if (activeSection === 'backup') {
      refreshBackups();
    }
  }, [activeSection]);

  // 立即备份
  const handleCreateBackup = () => {
    const snapshot = createBackup(itemsStore.list, vaults.list, []);
    saveBackup(snapshot);
    refreshBackups();
    setBackupMessage({ type: 'success', text: `备份成功！包含 ${snapshot.itemCount} 个条目` });
    setTimeout(() => setBackupMessage(null), 3000);
  };

  // 删除单个备份
  const handleDeleteBackup = (id: string) => {
    if (window.confirm('确定要删除此备份吗？')) {
      deleteBackup(id);
      refreshBackups();
    }
  };

  // 清空所有备份
  const handleClearAllBackups = () => {
    if (window.confirm('确定要清空所有备份吗？此操作不可恢复。')) {
      clearAllBackups();
      refreshBackups();
      setBackupMessage({ type: 'success', text: '已清空所有备份' });
      setTimeout(() => setBackupMessage(null), 3000);
    }
  };

  // ====== 域名自动填充设置状态 ======
  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [domainMessage, setDomainMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 设备列表来自 store
  const devices = profile.devices;

  // 复制恢复密钥
  const handleCopyRecoveryKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setRecoveryKeyCopied(true);
    setTimeout(() => setRecoveryKeyCopied(false), 2000);
  };

  // 文件拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      loadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadFile(files[0]);
    }
  };

  // 加载文件内容
  const loadFile = (file: File) => {
    setSelectedFile(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  // 执行导入
  const handleImport = () => {
    if (!importFileContent) return;

    try {
      const items = importData(importFileContent, importFormat);
      
      if (items.length === 0) {
        setImportResult({ success: false, count: 0, message: '未找到有效数据，请检查文件格式' });
        return;
      }

      items.forEach((item) => {
        itemsStore.addItem(item as Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>);
      });

      setLastImportDate(new Date().toLocaleString('zh-CN'));
      setImportResult({ success: true, count: items.length, message: `成功导入 ${items.length} 条密码` });
      setSelectedFile(null);
      setImportFileContent(null);
    } catch {
      setImportResult({ success: false, count: 0, message: '导入失败，请检查文件格式是否正确' });
    }
  };

  // 执行导出
  const handleExport = () => {
    const items = itemsStore.list;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'CSV':
        content = exportToCSV(items);
        filename = `vaultkey-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'JSON':
        content = exportToJSON(items);
        filename = `vaultkey-export-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case '1PIF':
        content = exportTo1PasswordCSV(items);
        filename = `vaultkey-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        content = exportToCSV(items);
        filename = `vaultkey-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setLastExportDate(new Date().toLocaleString('zh-CN'));
  };

  // 域名允许列表操作
  const handleAddAllowedDomain = () => {
    if (!newAllowedDomain.trim()) return;
    settings.addAllowedDomain(newAllowedDomain.trim());
    setNewAllowedDomain('');
    setDomainMessage({ type: 'success', text: '域名已添加到允许列表' });
    setTimeout(() => setDomainMessage(null), 2000);
  };

  const handleRemoveAllowedDomain = (domain: string) => {
    settings.removeAllowedDomain(domain);
    setDomainMessage({ type: 'success', text: '域名已从允许列表移除' });
    setTimeout(() => setDomainMessage(null), 2000);
  };

  // 域名阻止列表操作
  const handleAddBlockedDomain = () => {
    if (!newBlockedDomain.trim()) return;
    settings.addBlockedDomain(newBlockedDomain.trim());
    setNewBlockedDomain('');
    setDomainMessage({ type: 'success', text: '域名已添加到阻止列表' });
    setTimeout(() => setDomainMessage(null), 2000);
  };

  const handleRemoveBlockedDomain = (domain: string) => {
    settings.removeBlockedDomain(domain);
    setDomainMessage({ type: 'success', text: '域名已从阻止列表移除' });
    setTimeout(() => setDomainMessage(null), 2000);
  };

  // 渲染账户安全部分
  const renderAccountSecurity = () => (
    <div className="space-y-8">
      {/* 修改主密码 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Lock size={20} className="text-vault-accent" />
          {t.settings.changeMasterPassword}
        </h3>
        <div className="space-y-4 max-w-md">
          {/* 当前密码 */}
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.currentPassword}</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="vault-input w-full pr-10"
                placeholder={t.settings.currentPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {/* 新密码 */}
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.newPassword}</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="vault-input w-full pr-10"
                placeholder={t.settings.newPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {/* 确认密码 */}
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.confirmNewPassword}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="vault-input w-full pr-10"
                placeholder={t.settings.confirmNewPassword}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-text-muted hover:text-vault-text transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            className="vault-btn-primary text-sm"
            onClick={() => {
              setPasswordUpdateMessage(null);
              setShowPasswordModal(true);
            }}
          >
            {t.settings.updatePassword}
          </button>
        </div>
      </div>

      {/* 更新密码确认弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md vault-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-vault-text flex items-center gap-2">
                <Lock size={20} className="text-vault-accent" />
                {t.settings.confirmUpdatePassword}
              </h3>
              <button
                type="button"
                className="text-vault-text-muted hover:text-vault-text transition-colors"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">旧密码</label>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="vault-input w-full"
                  placeholder="输入当前主密码"
                />
              </div>
              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">新密码</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="vault-input w-full"
                  placeholder="输入新主密码"
                />
              </div>
              <div>
                <label className="block text-sm text-vault-text-secondary mb-1.5">确认新密码</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="vault-input w-full"
                  placeholder="再次输入新主密码"
                />
              </div>
              {passwordUpdateMessage && (
                <div
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg',
                    passwordUpdateMessage.type === 'success'
                      ? 'bg-vault-success/10 border border-vault-success/20'
                      : 'bg-vault-error/10 border border-vault-error/20'
                  )}
                >
                  <AlertCircle size={16} className={passwordUpdateMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error'} />
                  <p className={cn('text-sm', passwordUpdateMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error')}>
                    {passwordUpdateMessage.text}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  className="vault-btn-primary text-sm flex-1"
                  onClick={() => {
                    if (!currentPassword) {
                      setPasswordUpdateMessage({ type: 'error', text: '请输入当前密码' });
                      return;
                    }
                    if (!newPassword) {
                      setPasswordUpdateMessage({ type: 'error', text: '请输入新密码' });
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setPasswordUpdateMessage({ type: 'error', text: '两次输入的新密码不一致' });
                      return;
                    }
                    setPasswordUpdateMessage({ type: 'success', text: '主密码更新成功' });
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setTimeout(() => {
                      setShowPasswordModal(false);
                      setPasswordUpdateMessage(null);
                    }, 1500);
                  }}
                >
                  确认更新
                </button>
                <button
                  className="vault-btn-secondary text-sm"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordUpdateMessage(null);
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 两步验证 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Smartphone size={20} className="text-vault-accent" />
          {t.settings.twoFactorAuthentication}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-vault-text text-sm">{t.settings.enableTwoFactor}</p>
            <p className="text-vault-text-muted text-xs mt-1">{t.settings.useAuthenticatorApp}</p>
          </div>
          {/* 切换开关 */}
          <button
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              twoFactorEnabled ? 'bg-vault-accent' : 'bg-vault-border'
            )}
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                twoFactorEnabled && 'translate-x-6'
              )}
            />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-vault-accent/5 border border-vault-accent/20 rounded-lg">
            <p className="text-sm text-vault-accent">{t.settings.twoFactorEnabled}</p>
            <p className="text-xs text-vault-text-muted mt-1">
              请使用身份验证器应用扫描二维码完成设置。每次登录时将需要输入验证码。
            </p>
          </div>
        )}
      </div>

      {/* 恢复密钥 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <KeyRound size={20} className="text-vault-accent" />
          {t.settings.recoveryKey}
        </h3>
        <p className="text-vault-text-secondary text-sm mb-4">
          {t.settings.recoveryKeyDesc}
        </p>
        {/* 警告信息 */}
        <div className="flex items-start gap-2 p-3 bg-vault-orange/10 border border-vault-orange/20 rounded-lg mb-4">
          <AlertTriangle size={16} className="text-vault-orange shrink-0 mt-0.5" />
          <p className="text-xs text-vault-orange">
            {t.settings.saveRecoveryKey}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="vault-btn-secondary text-sm flex items-center gap-1.5"
            onClick={() => setShowRecoveryKey(!showRecoveryKey)}
          >
            {showRecoveryKey ? <EyeOff size={16} /> : <Eye size={16} />}
            {showRecoveryKey ? t.settings.hideKey : t.settings.showKey}
          </button>
          {showRecoveryKey && (
            <button
              className="vault-btn-secondary text-sm flex items-center gap-1.5"
              onClick={handleCopyRecoveryKey}
            >
              {recoveryKeyCopied ? <Check size={16} /> : <Copy size={16} />}
              {recoveryKeyCopied ? t.common.copied : t.settings.copyKey}
            </button>
          )}
        </div>
        {showRecoveryKey && (
          <div className="mt-4 p-3 bg-vault-surface border border-vault-border rounded-lg">
            <code className="text-vault-accent text-sm font-mono tracking-wider">{recoveryKey}</code>
          </div>
        )}
      </div>

      {/* 受信设备 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Monitor size={20} className="text-vault-accent" />
          {t.settings.trustedDevices}
        </h3>
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-3 bg-vault-surface border border-vault-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-vault-accent/10 flex items-center justify-center">
                  <Monitor size={16} className="text-vault-accent" />
                </div>
                <div>
                  <p className="text-sm text-vault-text font-medium">
                    {device.name}
                    {device.isCurrent && (
                      <span className="ml-2 vault-badge bg-vault-accent/10 text-vault-accent">{t.settings.currentDevice}</span>
                    )}
                  </p>
                  <p className="text-xs text-vault-text-muted">
                    {t.settings.lastActive}：{new Date(device.lastActiveAt).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
                  </p>
                </div>
              </div>
              {!device.isCurrent && (
                <button
                  className="text-xs text-vault-warn hover:text-vault-warn/80 transition-colors px-3 py-1 rounded-lg hover:bg-vault-warn/10"
                  onClick={() => {
                    if (confirm(`确定要移除设备「${device.name}」吗？移除后该设备将需要重新登录。`)) {
                      useStore.setState((state) => ({
                        profile: {
                          ...state.profile,
                          devices: state.profile.devices.filter((d) => d.id !== device.id),
                        },
                      }));
                    }
                  }}
                >
                  移除
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 紧急访问 */}
      <div className="vault-card p-6">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-vault-text flex items-center gap-2">
          <KeyRound size={20} className="text-vault-accent" />
          {t.settings.emergencyAccess}
        </h3>
        <button
          className="vault-btn-secondary text-sm"
          onClick={() => setShowAddEmergencyContact(!showAddEmergencyContact)}
        >
          {t.settings.addEmergencyContact}
        </button>
      </div>
      <p className="text-vault-text-secondary text-sm mb-4">
        {t.settings.emergencyAccessDesc}
      </p>

        {/* 添加紧急联系人表单 */}
        {showAddEmergencyContact && (
          <div className="mb-4 p-4 bg-vault-surface border border-vault-border rounded-lg">
            <h4 className="text-sm font-medium text-vault-text mb-3">{t.settings.addEmergencyContact}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-vault-text-secondary mb-1">{t.settings.trustedEmail}</label>
                <input
                  type="email"
                  value={emergencyEmail}
                  onChange={(e) => setEmergencyEmail(e.target.value)}
                  className="vault-input text-sm"
                  placeholder={t.settings.trustedEmail}
                />
              </div>
              <div>
                <label className="block text-xs text-vault-text-secondary mb-1">{t.settings.accessLevel}</label>
                <select
                  value={emergencyAccessLevel}
                  onChange={(e) => setEmergencyAccessLevel(e.target.value as 'view' | 'edit' | 'full')}
                  className="vault-input text-sm"
                >
                  <option value="view">{t.settings.readOnly}</option>
                  <option value="edit">{t.settings.fullEdit}</option>
                  <option value="full">{t.settings.fullAccess}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-vault-text-secondary mb-1">{t.settings.waitingPeriod}</label>
                <select
                  value={emergencyWaitPeriod}
                  onChange={(e) => setEmergencyWaitPeriod(Number(e.target.value))}
                  className="vault-input text-sm"
                >
                  <option value={1}>1 小时</option>
                  <option value={6}>6 小时</option>
                  <option value={24}>24 小时</option>
                  <option value={72}>72 小时</option>
                  <option value={168}>7 天</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approval-required"
                  checked={emergencyApprovalRequired}
                  onChange={(e) => setEmergencyApprovalRequired(e.target.checked)}
                />
                <label htmlFor="approval-required" className="text-xs text-vault-text-secondary">
                  {t.settings.approvalRequired}
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  className="vault-btn-primary text-sm flex-1"
                  onClick={() => {
                    if (!emergencyEmail) {
                      alert(language === 'zh' ? '请输入邮箱地址' : 'Please enter email address');
                      return;
                    }
                    const newAccess = {
                      id: `emergency-${Date.now()}`,
                      trustedEmail: emergencyEmail,
                      accessLevel: emergencyAccessLevel,
                      approvalRequired: emergencyApprovalRequired,
                      waitingPeriodHours: emergencyWaitPeriod,
                      createdAt: new Date().toISOString(),
                    };
                    settings.updateEmergencyAccess([...settings.emergencyAccess, newAccess]);
                    setEmergencyEmail('');
                    setEmergencyAccessLevel('view');
                    setEmergencyWaitPeriod(24);
                    setEmergencyApprovalRequired(true);
                    setShowAddEmergencyContact(false);
                  }}
                >
                  {t.common.add} {t.common.view}
                </button>
                <button
                  className="vault-btn-secondary text-sm"
                  onClick={() => {
                    setShowAddEmergencyContact(false);
                    setEmergencyEmail('');
                  }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {settings.emergencyAccess.map((access) => (
            <div
              key={access.id}
              className="flex items-center justify-between p-4 bg-vault-surface border border-vault-border rounded-lg"
            >
              <div>
                <p className="text-sm text-vault-text font-medium">{access.trustedEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-vault-text-muted">
                    权限：{access.accessLevel === 'view' ? '只读' : access.accessLevel === 'edit' ? '编辑' : '完全'}
                  </span>
                  <span className="text-xs text-vault-text-muted">|</span>
                  <span className="text-xs text-vault-text-muted">
                    等待期：{access.waitingPeriodHours} 小时
                  </span>
                  {access.approvalRequired && (
                    <span className="vault-badge bg-vault-accent/10 text-vault-accent text-xs">需审批</span>
                  )}
                </div>
              </div>
              <button
                className="text-xs text-vault-warn hover:text-vault-warn/80 transition-colors px-3 py-1 rounded-lg hover:bg-vault-warn/10"
                onClick={() => {
                  settings.updateEmergencyAccess(settings.emergencyAccess.filter((a) => a.id !== access.id));
                }}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染安全设置部分
  const renderSecuritySettings = () => (
    <div className="space-y-8">
      {/* 自动锁定 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Lock size={20} className="text-vault-accent" />
          {t.settings.autoLock}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.autoLockIdle}</label>
            <select
              value={autoLockMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setAutoLockMinutes(value);
                settings.updateSettings({ autoLockMinutes: value });
              }}
              className="vault-input w-full appearance-none cursor-pointer max-w-md"
            >
              <option value={0}>永不自动锁定</option>
              <option value={1}>1 分钟</option>
              <option value={5}>5 分钟</option>
              <option value={15}>15 分钟</option>
              <option value={30}>30 分钟</option>
              <option value={60}>1 小时</option>
            </select>
            <p className="text-xs text-vault-text-muted mt-2">{t.settings.autoLockDesc}</p>
          </div>
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.lockOnScreenLock}</label>
            <p className="text-sm text-vault-text mb-3">{t.settings.lockOnScreenLockDesc}</p>
            <button
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors duration-200',
                lockOnScreenLock ? 'bg-vault-accent' : 'bg-vault-border'
              )}
              disabled
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                  lockOnScreenLock && 'translate-x-6'
                )}
              />
            </button>
            <span className="ml-3 text-sm text-vault-text-muted">已启用</span>
          </div>
        </div>
      </div>

      {/* 剪贴板安全 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Copy size={20} className="text-vault-accent" />
          {t.settings.clipboardSecurity}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.autoClearClipboard}</label>
            <select
              value={clipboardClearSeconds}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setClipboardClearSeconds(value);
                settings.updateSettings({ clipboardClearSeconds: value });
                persistClipboardSettings(value);
              }}
              className="vault-input w-full appearance-none cursor-pointer max-w-md"
            >
              <option value={0}>永不清空</option>
              <option value={10}>10 秒</option>
              <option value={30}>30 秒</option>
              <option value={60}>1 分钟</option>
              <option value={120}>2 分钟</option>
            </select>
            <p className="text-xs text-vault-text-muted mt-2">{t.settings.autoClearClipboardDesc}</p>
          </div>
        </div>
      </div>

      {/* 防暴力破解 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-vault-accent" />
          {t.settings.antiBruteForce}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-vault-text">{t.settings.failedAttemptsLock}</p>
            <p className="text-xs text-vault-text-muted mt-1">连续 {failedAttemptsBeforeLock} 次输入错误后锁定应用</p>
          </div>
          <span className="vault-badge bg-vault-accent/10 text-vault-accent">已启用</span>
        </div>
      </div>

      {/* 旅行模式 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Globe size={20} className="text-vault-accent" />
          {t.settings.travelMode}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-vault-text">{t.settings.enableTravelMode}</p>
            <p className="text-xs text-vault-text-muted mt-1">{t.settings.travelModeDesc}</p>
          </div>
          <button
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors duration-200',
              travelModeEnabled ? 'bg-vault-accent' : 'bg-vault-border'
            )}
            onClick={() => {
              setTravelModeEnabled(!travelModeEnabled);
              settings.toggleTravelMode();
            }}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                travelModeEnabled && 'translate-x-6'
              )}
            />
          </button>
        </div>

        {/* 选择隐藏的保险库 */}
        {!travelModeEnabled && (
          <div className="mt-4 p-4 bg-vault-surface border border-vault-border rounded-lg">
            <h4 className="text-sm font-medium text-vault-text mb-3">{t.settings.selectHiddenVaults}</h4>
            <div className="space-y-2">
              {vaults.list.map((vault) => (
                <div key={vault.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`vault-${vault.id}`}
                    checked={vault.isHidden}
                    onChange={() => {
                      vaults.updateVault(vault.id, { isHidden: !vault.isHidden });
                    }}
                  />
                  <label htmlFor={`vault-${vault.id}`} className="text-sm text-vault-text-secondary">
                    {vault.name}
                    {vault.isDefault && <span className="ml-2 text-xs text-vault-accent">(默认)</span>}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-vault-text-muted mt-3">
              启用旅行模式后，勾选的保险库将被隐藏，需使用主密码解锁才能查看。
            </p>
          </div>
        )}

        {travelModeEnabled && (
          <div className="mt-4 p-4 bg-vault-accent/5 border border-vault-accent/20 rounded-lg">
            <p className="text-sm text-vault-accent">{t.settings.travelModeEnabled}</p>
            <p className="text-xs text-vault-text-muted mt-1">
              已隐藏 {vaults.list.filter((v) => v.isHidden).length} 个保险库。如需恢复，请再次切换旅行模式。
            </p>
          </div>
        )}
      </div>

      {/* 自动填充域名设置 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Globe size={20} className="text-vault-accent" />
          自动填充域名设置
        </h3>

        {/* 匹配模式 */}
        <div className="mb-6">
          <label className="block text-sm text-vault-text-secondary mb-2">匹配模式</label>
          <div className="flex gap-2">
            <button
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                settings.settings.matchMode === 'exact'
                  ? 'bg-vault-accent text-white'
                  : 'bg-vault-surface text-vault-text-secondary border border-vault-border hover:border-vault-accent/30'
              )}
              onClick={() => {
                settings.setMatchMode('exact');
                setDomainMessage({ type: 'success', text: '匹配模式已切换为精确匹配' });
                setTimeout(() => setDomainMessage(null), 2000);
              }}
            >
              精确匹配
            </button>
            <button
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                settings.settings.matchMode === 'fuzzy'
                  ? 'bg-vault-accent text-white'
                  : 'bg-vault-surface text-vault-text-secondary border border-vault-border hover:border-vault-accent/30'
              )}
              onClick={() => {
                settings.setMatchMode('fuzzy');
                setDomainMessage({ type: 'success', text: '匹配模式已切换为模糊匹配' });
                setTimeout(() => setDomainMessage(null), 2000);
              }}
            >
              模糊匹配
            </button>
          </div>
          <p className="text-xs text-vault-text-muted mt-2">
            {settings.settings.matchMode === 'exact' ? '仅匹配完全相同的域名' : '匹配包含域名的网站'}
          </p>
        </div>

        {/* 域名允许列表 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-vault-text-secondary">域名允许列表</label>
            <span className="text-xs text-vault-text-muted">{settings.settings.allowedDomains.length} 个域名</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAllowedDomain}
              onChange={(e) => setNewAllowedDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddAllowedDomain();
                }
              }}
              className="vault-input flex-1 max-w-md"
              placeholder="输入域名，如 *.google.com"
            />
            <button
              className="vault-btn-primary text-sm flex items-center gap-1"
              onClick={handleAddAllowedDomain}
            >
              <Plus size={16} />
              添加
            </button>
          </div>
          <div className="space-y-2">
            {settings.settings.allowedDomains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between p-2 bg-vault-surface border border-vault-border rounded-lg"
              >
                <span className="text-sm text-vault-text">{domain}</span>
                <button
                  className="text-vault-warn hover:text-vault-warn/80 transition-colors"
                  onClick={() => handleRemoveAllowedDomain(domain)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {settings.settings.allowedDomains.length === 0 && (
            <p className="text-xs text-vault-text-muted mt-2">暂无允许的域名，添加后将仅在这些域名上自动填充</p>
          )}
        </div>

        {/* 域名阻止列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm text-vault-text-secondary">域名阻止列表</label>
            <span className="text-xs text-vault-text-muted">{settings.settings.blockedDomains.length} 个域名</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newBlockedDomain}
              onChange={(e) => setNewBlockedDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddBlockedDomain();
                }
              }}
              className="vault-input flex-1 max-w-md"
              placeholder="输入域名，如 *.example.com"
            />
            <button
              className="vault-btn-primary text-sm flex items-center gap-1"
              onClick={handleAddBlockedDomain}
            >
              <Plus size={16} />
              添加
            </button>
          </div>
          <div className="space-y-2">
            {settings.settings.blockedDomains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between p-2 bg-vault-surface border border-vault-border rounded-lg"
              >
                <span className="text-sm text-vault-text">{domain}</span>
                <button
                  className="text-vault-warn hover:text-vault-warn/80 transition-colors"
                  onClick={() => handleRemoveBlockedDomain(domain)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {settings.settings.blockedDomains.length === 0 && (
            <p className="text-xs text-vault-text-muted mt-2">暂无阻止的域名，添加后将在这些域名上禁止自动填充</p>
          )}
        </div>

        {domainMessage && (
          <div
            className={cn(
              'mt-4 flex items-center gap-2 p-3 rounded-lg',
              domainMessage.type === 'success'
                ? 'bg-vault-success/10 border border-vault-success/20'
                : 'bg-vault-error/10 border border-vault-error/20'
            )}
          >
            <Check size={16} className={domainMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error'} />
            <p className={cn('text-sm', domainMessage.type === 'success' ? 'text-vault-success' : 'text-vault-error')}>
              {domainMessage.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染外观主题部分
  const renderAppearance = () => {
    const themes: { value: 'dark' | 'light' | 'system'; label: string; icon: React.ElementType; desc: string }[] = [
      { value: 'dark', label: t.settings.dark, icon: Moon, desc: t.settings.darkDesc },
      { value: 'light', label: t.settings.light, icon: Sun, desc: t.settings.lightDesc },
      { value: 'system', label: t.settings.system, icon: Monitor, desc: t.settings.systemDesc },
    ];

    return (
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Palette size={20} className="text-vault-accent" />
          {t.settings.themeSelection}
        </h3>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.value;
            return (
              <button
                key={theme.value}
                className={cn(
                  'flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-vault-accent bg-vault-accent/5 shadow-lg shadow-vault-accent/10'
                    : 'border-vault-border bg-vault-surface hover:border-vault-accent/30'
                )}
                onClick={() => {
                  setSelectedTheme(theme.value);
                  ui.setTheme(theme.value);
                }}
              >
                {/* 主题预览框 */}
                <div
                  className={cn(
                    'w-16 h-12 rounded-lg border',
                    theme.value === 'dark' && 'bg-[#0A1628] border-[#1E3A5F]',
                    theme.value === 'light' && 'bg-[#F8F9FC] border-[#E2E8F0]',
                    theme.value === 'system' && 'bg-gradient-to-br from-[#0A1628] to-[#F8F9FC] border-[#1E3A5F]'
                  )}
                />
                <Icon
                  size={20}
                  className={isSelected ? 'text-vault-accent' : 'text-vault-text-secondary'}
                />
                <div className="text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-vault-accent' : 'text-vault-text'
                    )}
                  >
                    {theme.label}
                  </p>
                  <p className="text-xs text-vault-text-muted mt-0.5">{theme.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染导入导出部分
  const renderImportExport = () => (
    <div className="space-y-8">
      {/* 导入部分 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Upload size={20} className="text-vault-accent" />
          {t.settings.importData}
        </h3>
        <div className="space-y-4 max-w-lg">
          {/* 格式选择 */}
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.selectImportFormat}</label>
            <select
              value={importFormat}
              onChange={(e) => setImportFormat(e.target.value)}
              className="vault-input w-full appearance-none cursor-pointer"
            >
              {importFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          {/* 文件拖拽上传区域 */}
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
              isDragging
                ? 'border-vault-accent bg-vault-accent/5'
                : 'border-vault-border hover:border-vault-accent/30'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload
              size={32}
              className={cn(
                'mx-auto mb-3',
                isDragging ? 'text-vault-accent' : 'text-vault-text-muted'
              )}
            />
            <p className="text-sm text-vault-text-secondary">
            {selectedFile ? selectedFile : t.settings.dragFileHere}
          </p>
          <p className="text-xs text-vault-text-muted mt-1">{t.settings.supportedFormats}</p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".csv,.1pif,.json"
              onChange={handleFileSelect}
            />
          </div>
          {importResult && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg',
                importResult.success
                  ? 'bg-vault-success/10 border border-vault-success/20'
                  : 'bg-vault-error/10 border border-vault-error/20'
              )}
            >
              {importResult.success ? (
                <Check size={16} className="text-vault-success shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-vault-error shrink-0" />
              )}
              <p className={cn('text-sm', importResult.success ? 'text-vault-success' : 'text-vault-error')}>
                {importResult.message}
              </p>
            </div>
          )}
          <button
            className="vault-btn-primary text-sm"
            disabled={!importFileContent}
            onClick={handleImport}
          >
            {t.settings.import}
          </button>
        </div>
      </div>

      {/* 导出部分 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <Download size={20} className="text-vault-accent" />
          {t.settings.exportData}
        </h3>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.selectExportFormat}</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="vault-input w-full appearance-none cursor-pointer"
            >
              {exportFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-start gap-2 p-3 bg-vault-warn/10 border border-vault-warn/20 rounded-lg">
            <AlertTriangle size={16} className="text-vault-warn shrink-0 mt-0.5" />
            <p className="text-xs text-vault-warn">
            {t.settings.exportWarning}
          </p>
          </div>
          <button className="vault-btn-primary text-sm flex items-center gap-1.5" onClick={handleExport}>
            <Download size={16} />
            {t.settings.exportAll}
          </button>
        </div>
        <div className="mt-6 pt-4 border-t border-vault-border">
          <p className="text-xs text-vault-text-muted">
            {t.settings.lastImport}：{lastImportDate}
          </p>
          <p className="text-xs text-vault-text-muted mt-1">
            {t.settings.lastExport}：{lastExportDate}
          </p>
        </div>
      </div>
    </div>
  );

  // 渲染备份与恢复部分
  const renderBackup = () => (
    <div className="space-y-8">
      {/* 立即备份 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <HardDriveDownload size={20} className="text-vault-accent" />
          本地备份
        </h3>
        <div className="space-y-4 max-w-lg">
          <p className="text-sm text-vault-text-secondary">
            将当前所有保险库数据创建一份本地备份快照。备份保存在浏览器本地存储中，最多保留 10 份。
          </p>
          <div className="flex items-center gap-3">
            <button
              className="vault-btn-primary text-sm flex items-center gap-1.5"
              onClick={handleCreateBackup}
            >
              <HardDriveDownload size={16} />
              立即备份
            </button>
            <span className="text-xs text-vault-text-muted">
              当前共 {itemsStore.list.length} 个条目
            </span>
          </div>
          {backupMessage && (
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              backupMessage.type === 'success'
                ? 'bg-vault-success/10 text-vault-success'
                : 'bg-vault-error/10 text-vault-error'
            )}>
              {backupMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              {backupMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* 备份历史列表 */}
      <div className="vault-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-vault-text flex items-center gap-2">
            <History size={20} className="text-vault-accent" />
            备份历史
          </h3>
          {backups.length > 0 && (
            <button
              onClick={handleClearAllBackups}
              className="text-xs text-vault-warn hover:text-vault-warn/80 transition-colors"
            >
              清空全部
            </button>
          )}
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-8">
            <History size={32} className="mx-auto text-vault-text-muted mb-2" />
            <p className="text-sm text-vault-text-muted">暂无备份记录</p>
            <p className="text-xs text-vault-text-muted mt-1">点击"立即备份"创建第一份备份</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-vault-hover/30 hover:bg-vault-hover/50 transition-colors"
              >
                <HardDriveDownload size={16} className="text-vault-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-vault-text">
                    {backup.itemCount} 个条目 · {backup.vaultCount} 个保险库
                  </div>
                  <div className="text-xs text-vault-text-muted">
                    {formatBackupTime(backup.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => downloadBackup(backup)}
                    className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                    title="下载备份"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-warn hover:bg-vault-warn/10 transition-colors"
                    title="删除备份"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 恢复说明 */}
      <div className="vault-card p-6">
        <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
          <RotateCcw size={20} className="text-vault-accent" />
          关于恢复
        </h3>
        <div className="space-y-3 text-sm text-vault-text-secondary max-w-lg">
          <p>下载的备份文件为 JSON 格式，包含完整的保险库数据。</p>
          <p>如需恢复数据，可通过"导入导出"功能选择 JSON 格式导入备份文件。</p>
          <div className="flex items-start gap-2 p-3 bg-vault-warn/10 border border-vault-warn/20 rounded-lg">
            <AlertTriangle size={16} className="text-vault-warn shrink-0 mt-0.5" />
            <p className="text-xs text-vault-warn">
              备份数据未加密，请妥善保管下载的备份文件，避免在公共设备上保存。
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染语言设置部分
  const renderLanguage = () => (
    <div className="vault-card p-6">
      <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
        <Globe size={20} className="text-vault-accent" />
        {t.settings.language}
      </h3>
      <div className="max-w-md">
        <label className="block text-sm text-vault-text-secondary mb-1.5">{t.settings.selectLanguage}</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
          className="vault-input w-full appearance-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-vault-text-muted mt-2">{t.settings.currentLanguage}：{getLanguageName(language)}</p>
      </div>
    </div>
  );

  // 渲染关于部分
  const renderAbout = () => (
    <div className="vault-card p-6">
      <h3 className="text-lg font-semibold text-vault-text mb-4 flex items-center gap-2">
        <Info size={20} className="text-vault-accent" />
        {t.settings.about} VaultKey
      </h3>
      <div className="space-y-4">
        {/* 版本信息 */}
        <div className="flex items-center justify-between py-3 border-b border-vault-border">
          <span className="text-sm text-vault-text-secondary">{t.settings.version}</span>
          <span className="text-sm text-vault-text font-mono">1.0.0</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-vault-border">
          <span className="text-sm text-vault-text-secondary">{t.settings.buildVersion}</span>
          <span className="text-sm text-vault-text font-mono">2025.07.13-stable</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-vault-border">
          <span className="text-sm text-vault-text-secondary">{t.settings.runtime}</span>
          <span className="text-sm text-vault-text font-mono">Web / Chromium</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-vault-border">
          <span className="text-sm text-vault-text-secondary">{t.settings.subscription}</span>
          <span className="vault-badge bg-vault-accent/10 text-vault-accent">Premium</span>
        </div>

        {/* 链接 */}
        <div className="pt-4 space-y-2">
          <button className="flex items-center justify-between w-full py-2.5 text-sm text-vault-text-secondary hover:text-vault-text transition-colors group">
            <span>{t.settings.privacyPolicy}</span>
            <ChevronRight size={16} className="text-vault-text-muted group-hover:text-vault-text transition-colors" />
          </button>
          <button className="flex items-center justify-between w-full py-2.5 text-sm text-vault-text-secondary hover:text-vault-text transition-colors group">
            <span>{t.settings.termsOfService}</span>
            <ChevronRight size={16} className="text-vault-text-muted group-hover:text-vault-text transition-colors" />
          </button>
          <button className="flex items-center justify-between w-full py-2.5 text-sm text-vault-text-secondary hover:text-vault-text transition-colors group">
            <span>{t.settings.openSourceLicense}</span>
            <ChevronRight size={16} className="text-vault-text-muted group-hover:text-vault-text transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染当前活动部分
  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSecurity();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearance();
      case 'importExport':
        return renderImportExport();
      case 'backup':
        return renderBackup();
      case 'language':
        return renderLanguage();
      case 'about':
        return renderAbout();
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="flex gap-6 h-full animate-fade-in">
        {/* 左侧导航 */}
        <nav className="w-52 shrink-0">
          <div className="vault-card p-3">
            <h2 className="text-xs font-semibold text-vault-text-muted uppercase tracking-wider px-3 mb-2">
              设置
            </h2>
            <div className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    className={cn(
                      'sidebar-item w-full text-sm',
                      isActive && 'active'
                    )}
                    onClick={() => setActiveSection(section.key)}
                  >
                    <Icon size={18} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* 右侧内容区域 */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <h1 className="text-2xl font-bold text-vault-text mb-6">
            {settingsSections.find((s) => s.key === activeSection)?.label}
          </h1>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}
