// VaultKey 密码管理器 - 保管库管理页面
import { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  MoreVertical,
  Shield,
  Key,
  Briefcase,
  Home,
  Heart,
  Star,
  Globe,
  Lock,
  Edit3,
  Share2,
  Archive,
  Trash2,
  X,
  UserPlus,
  Check,
  Trash,
  ChevronDown,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Vault } from '@/types';
import { toast } from '@/components/toastStore';

// 图标选项
const iconOptions = [
  { icon: Shield, label: 'Shield' },
  { icon: Key, label: 'Key' },
  { icon: Briefcase, label: 'Briefcase' },
  { icon: Home, label: 'Home' },
  { icon: Heart, label: 'Heart' },
  { icon: Star, label: 'Star' },
  { icon: Globe, label: 'Globe' },
  { icon: Lock, label: 'Lock' },
];

// 颜色选项
const colorOptions = [
  { value: '#3B82F6', label: '蓝色' },   // accent blue
  { value: '#8B5CF6', label: '紫色' },   // purple
  { value: '#FF9F43', label: '橙色' },   // orange
  { value: '#FF6B6B', label: '红色' },   // red
  { value: '#00D4AA', label: '绿色' },   // green
  { value: '#EC4899', label: '粉色' },   // pink
];

// 角色标签映射
const roleLabels: Record<string, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员',
};

// 生成头像颜色
const getAvatarColor = (email: string): string => {
  const colors = ['#3B82F6', '#8B5CF6', '#FF9F43', '#FF6B6B', '#00D4AA', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 获取邮箱用户名
const getUserName = (email: string): string => {
  return email.split('@')[0];
};

// 验证邮箱格式
const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function Vaults() {
  const { vaults } = useStore();

  // ====== 新建保管库对话框状态 ======
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDesc, setNewVaultDesc] = useState('');
  const [newVaultIcon, setNewVaultIcon] = useState('Shield');
  const [newVaultColor, setNewVaultColor] = useState('#3B82F6');

  // ====== 编辑保管库对话框状态 ======
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editVaultName, setEditVaultName] = useState('');
  const [editVaultDesc, setEditVaultDesc] = useState('');
  const [editVaultIcon, setEditVaultIcon] = useState('Shield');
  const [editVaultColor, setEditVaultColor] = useState('#3B82F6');

  // ====== 成员管理状态 ======
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ====== 菜单状态 ======
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 通知自动消失
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 显示通知
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  // 邀请新成员
  const handleInviteMember = () => {
    if (!editingVault) return;
    if (!inviteEmail.trim()) {
      showNotification('error', '请输入邮箱地址');
      return;
    }
    if (!isValidEmail(inviteEmail)) {
      showNotification('error', '请输入有效的邮箱地址');
      return;
    }
    const existingMembers = editingVault.members || [];
    if (existingMembers.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      showNotification('error', '该邮箱已被邀请');
      return;
    }
    vaults.addVaultMember(editingVault.id, inviteEmail.trim(), inviteRole);
    showNotification('success', '成员邀请成功');
    setInviteEmail('');
    setInviteRole('member');
    setShowInviteForm(false);
  };

  // 移除成员
  const handleRemoveMember = (memberId: string) => {
    if (!editingVault) return;
    vaults.removeVaultMember(editingVault.id, memberId);
    showNotification('success', '成员已移除');
    setExpandedMemberId(null);
  };

  // 更新成员角色
  const handleUpdateMemberRole = (memberId: string, role: 'admin' | 'member') => {
    if (!editingVault) return;
    vaults.updateVaultMemberRole(editingVault.id, memberId, role);
    showNotification('success', '角色已更新');
    setExpandedMemberId(null);
  };

  // 打开新建对话框
  const handleOpenNewDialog = () => {
    setNewVaultName('');
    setNewVaultDesc('');
    setNewVaultIcon('Shield');
    setNewVaultColor('#3B82F6');
    setShowNewDialog(true);
  };

  // 创建保管库
  const handleCreateVault = () => {
    if (!newVaultName.trim()) return;
    vaults.addVault({
      name: newVaultName.trim(),
      description: newVaultDesc.trim() || undefined,
      icon: newVaultIcon,
      color: newVaultColor,
    });
    setShowNewDialog(false);
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (vault: Vault) => {
    setEditingVault(vault);
    setEditVaultName(vault.name);
    setEditVaultDesc(vault.description || '');
    setEditVaultIcon(vault.icon);
    setEditVaultColor(vault.color);
    setShowInviteForm(false);
    setInviteEmail('');
    setInviteRole('member');
    setExpandedMemberId(null);
    setShowEditDialog(true);
    setOpenMenuId(null);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingVault) return;
    vaults.updateVault(editingVault.id, {
      name: editVaultName.trim(),
      description: editVaultDesc.trim() || undefined,
      icon: editVaultIcon,
      color: editVaultColor,
    });
    setShowEditDialog(false);
    setEditingVault(null);
  };

  // 删除保管库
  const handleDeleteVault = (vaultId: string) => {
    const vault = vaults.list.find((v) => v.id === vaultId);
    if (vault && window.confirm(`确定要删除保管库 "${vault.name}" 吗？此操作不可撤销，该保管库中的所有项目都将被删除。`)) {
      vaults.deleteVault(vaultId);
    }
    setOpenMenuId(null);
  };

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find((o) => o.label === iconName);
    return found ? found.icon : FolderOpen;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 渲染新建/编辑对话框共享部分（图标选择器 + 颜色选择器）
  const renderIconAndColorPicker = (
    selectedIcon: string,
    setSelectedIcon: (v: string) => void,
    selectedColor: string,
    setSelectedColor: (v: string) => void
  ) => (
    <>
      {/* 图标选择 */}
      <div>
        <label className="block text-sm text-vault-text-secondary mb-2">图标</label>
        <div className="grid grid-cols-8 gap-2">
          {iconOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedIcon === option.label;
            return (
              <button
                key={option.label}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-vault-accent/20 border-2 border-vault-accent'
                    : 'bg-vault-surface border border-vault-border hover:border-vault-accent/30'
                )}
                onClick={() => setSelectedIcon(option.label)}
              >
                <Icon
                  size={18}
                  className={isSelected ? 'text-vault-accent' : 'text-vault-text-secondary'}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 颜色选择 */}
      <div>
        <label className="block text-sm text-vault-text-secondary mb-2">颜色</label>
        <div className="flex gap-3">
          {colorOptions.map((option) => {
            const isSelected = selectedColor === option.value;
            return (
              <button
                key={option.value}
                className={cn(
                  'w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-offset-vault-card'
                    : 'hover:scale-110'
                )}
                style={{
                  backgroundColor: option.value,
                  ringColor: option.value,
                  ...(isSelected ? { ringColor: option.value } : {}),
                }}
                onClick={() => setSelectedColor(option.value)}
                title={option.label}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-vault-text">保管库管理</h1>
          <button
            className="vault-btn-primary text-sm flex items-center gap-1.5"
            onClick={handleOpenNewDialog}
          >
            <Plus size={16} />
            新建保管库
          </button>
        </div>

        {/* 保管库网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaults.list.map((vault) => {
          const VaultIcon = getIconComponent(vault.icon);
          const members = vault.members || [];
          const hasOtherMembers = members.some((m) => m.role !== 'owner');
          return (
            <div key={vault.id} className="vault-card p-5 group relative">
              <div className="flex items-start gap-4">
                {/* 保管库图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${vault.color}20` }}
                >
                  <VaultIcon size={24} style={{ color: vault.color }} />
                </div>

                {/* 保管库信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-vault-text truncate">
                      {vault.name}
                    </h3>
                    {/* 更多操作按钮 */}
                    <div className="relative" ref={menuRef}>
                      <button
                        className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => setOpenMenuId(openMenuId === vault.id ? null : vault.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {/* 下拉菜单 */}
                      {openMenuId === vault.id && (
                        <div className="absolute right-0 top-8 z-20 w-36 bg-vault-surface border border-vault-border rounded-xl shadow-xl py-1 animate-fade-in">
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                            onClick={() => handleOpenEditDialog(vault)}
                          >
                            <Edit3 size={14} />
                            编辑
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleOpenEditDialog(vault);
                            }}
                          >
                            <Share2 size={14} />
                            共享
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                            onClick={() => {
                              setOpenMenuId(null);
                              toast.warning('归档功能开发中');
                            }}
                          >
                            <Archive size={14} />
                            归档
                          </button>
                          <div className="border-t border-vault-border my-1" />
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-vault-warn hover:bg-vault-warn/10 transition-colors"
                            onClick={() => handleDeleteVault(vault.id)}
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 描述 */}
                  {vault.description && (
                    <p className="text-sm text-vault-text-secondary mt-1 line-clamp-1">
                      {vault.description}
                    </p>
                  )}

                  {/* 统计信息 */}
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-vault-text-muted">
                      {vault.itemCount} 个项目
                    </span>
                    <span className="text-xs text-vault-text-muted">
                      更新于 {formatDate(vault.updatedAt)}
                    </span>
                  </div>

                  {/* 共享成员头像 */}
                  {hasOtherMembers && (
                    <div className="flex items-center mt-3">
                      <div className="flex -space-x-2">
                        {members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full border-2 border-vault-card flex items-center justify-center text-[10px] font-semibold text-white"
                            style={{ backgroundColor: getAvatarColor(member.email) }}
                            title={`${getUserName(member.email)} (${roleLabels[member.role]})`}
                          >
                            {getUserName(member.email)[0].toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-vault-text-muted ml-2">
                        {members.length} 位成员
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* 通知组件 */}
        {notification && (
          <div
            className={cn(
              'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-slide-right',
              notification.type === 'success'
                ? 'bg-vault-success text-white'
                : 'bg-vault-warn text-white'
            )}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {/* ====== 新建保管库对话框 ====== */}
        {showNewDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 遮罩层 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewDialog(false)} />
            {/* 对话框内容 */}
            <div className="relative z-10 w-full max-w-md bg-vault-surface border border-vault-border rounded-2xl shadow-2xl p-6 animate-slide-up">
              {/* 标题 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-vault-text">新建保管库</h2>
                <button
                  className="p-1 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                  onClick={() => setShowNewDialog(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 名称 */}
                <div>
                  <label className="block text-sm text-vault-text-secondary mb-1.5">名称</label>
                  <input
                    type="text"
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                    className="vault-input w-full"
                    placeholder="输入保管库名称"
                    autoFocus
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm text-vault-text-secondary mb-1.5">描述</label>
                  <textarea
                    value={newVaultDesc}
                    onChange={(e) => setNewVaultDesc(e.target.value)}
                    className="vault-input w-full resize-none"
                    rows={3}
                    placeholder="输入保管库描述（可选）"
                  />
                </div>

                {/* 图标和颜色 */}
                {renderIconAndColorPicker(newVaultIcon, setNewVaultIcon, newVaultColor, setNewVaultColor)}

                {/* 创建按钮 */}
                <button
                  className={cn(
                    'vault-btn-primary w-full text-sm',
                    !newVaultName.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={handleCreateVault}
                  disabled={!newVaultName.trim()}
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== 编辑保管库对话框 ====== */}
        {showEditDialog && editingVault && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 遮罩层 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditDialog(false)} />
            {/* 对话框内容 */}
            <div className="relative z-10 w-full max-w-md bg-vault-surface border border-vault-border rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              {/* 标题 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-vault-text">编辑保管库</h2>
                <button
                  className="p-1 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                  onClick={() => setShowEditDialog(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* 名称 */}
                <div>
                  <label className="block text-sm text-vault-text-secondary mb-1.5">名称</label>
                  <input
                    type="text"
                    value={editVaultName}
                    onChange={(e) => setEditVaultName(e.target.value)}
                    className="vault-input w-full"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm text-vault-text-secondary mb-1.5">描述</label>
                  <textarea
                    value={editVaultDesc}
                    onChange={(e) => setEditVaultDesc(e.target.value)}
                    className="vault-input w-full resize-none"
                    rows={3}
                  />
                </div>

                {/* 图标和颜色 */}
                {renderIconAndColorPicker(editVaultIcon, setEditVaultIcon, editVaultColor, setEditVaultColor)}

                {/* 共享成员列表 */}
                <div>
                  <label className="block text-sm text-vault-text-secondary mb-2">共享成员</label>
                  <div className="space-y-2">
                    {(editingVault?.members || []).map((member) => (
                      <div
                        key={member.id}
                        className="relative flex items-center justify-between p-2.5 bg-vault-card border border-vault-border rounded-lg"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ backgroundColor: getAvatarColor(member.email) }}
                          >
                            {getUserName(member.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-vault-text">{getUserName(member.email)}</p>
                            <p className="text-xs text-vault-text-muted">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'vault-badge text-[10px]',
                              member.role === 'owner' && 'bg-vault-accent/10 text-vault-accent',
                              member.role === 'admin' && 'bg-vault-purple/10 text-vault-purple',
                              member.role === 'member' && 'bg-vault-blue/10 text-vault-blue'
                            )}
                          >
                            {roleLabels[member.role]}
                          </span>
                          {member.role !== 'owner' && (
                            <button
                              className="p-1.5 rounded-lg text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors"
                              onClick={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                            >
                              <ChevronDown size={14} className={expandedMemberId === member.id ? 'rotate-180' : ''} />
                            </button>
                          )}
                        </div>
                        {/* 操作菜单 */}
                        {expandedMemberId === member.id && (
                          <div className="absolute right-0 top-full mt-1 bg-vault-surface border border-vault-border rounded-lg shadow-lg py-1 z-10">
                            <button
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-vault-text-secondary hover:bg-vault-hover hover:text-vault-text transition-colors"
                              onClick={() => handleUpdateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                            >
                              <Edit3 size={12} />
                              {member.role === 'admin' ? '设为成员' : '设为管理员'}
                            </button>
                            <button
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-vault-warn hover:bg-vault-warn/10 transition-colors"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash size={12} />
                              移除
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 邀请表单 */}
                  {showInviteForm ? (
                    <div className="mt-3 p-3 bg-vault-card border border-vault-border rounded-lg space-y-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="vault-input w-full text-sm"
                        placeholder="输入邮箱地址"
                        autoFocus
                      />
                      <div>
                        <label className="block text-xs text-vault-text-secondary mb-1.5">角色</label>
                        <div className="flex gap-2">
                          <button
                            className={cn(
                              'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
                              inviteRole === 'member'
                                ? 'border-vault-accent bg-vault-accent/10 text-vault-accent'
                                : 'border-vault-border text-vault-text-secondary hover:border-vault-accent/30'
                            )}
                            onClick={() => setInviteRole('member')}
                          >
                            成员
                          </button>
                          <button
                            className={cn(
                              'flex-1 py-1.5 text-xs rounded-lg border transition-colors',
                              inviteRole === 'admin'
                                ? 'border-vault-accent bg-vault-accent/10 text-vault-accent'
                                : 'border-vault-border text-vault-text-secondary hover:border-vault-accent/30'
                            )}
                            onClick={() => setInviteRole('admin')}
                          >
                            管理员
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 vault-btn-secondary text-xs"
                          onClick={() => {
                            setShowInviteForm(false);
                            setInviteEmail('');
                          }}
                        >
                          取消
                        </button>
                        <button
                          className="flex-1 vault-btn-primary text-xs"
                          onClick={handleInviteMember}
                        >
                          邀请
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="mt-3 vault-btn-secondary text-sm flex items-center gap-1.5 w-full justify-center"
                      onClick={() => setShowInviteForm(true)}
                    >
                      <UserPlus size={14} />
                      邀请成员
                    </button>
                  )}
                </div>

                {/* 保存按钮 */}
                <button
                  className={cn(
                    'vault-btn-primary w-full text-sm',
                    !editVaultName.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={handleSaveEdit}
                  disabled={!editVaultName.trim()}
                >
                  保存更改
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
