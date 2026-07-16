import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Calendar, Lock, Edit, Trash2, RefreshCw, FileText, KeyRound, User } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from '@/components/Toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
  vaultCount: number;
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  travelModeEnabled: boolean;
  loginCount: number;
  lastIP: string;
}

interface VaultInfo {
  id: string;
  name: string;
  itemCount: number;
  shared: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  device: string;
}

const mockUsers: Record<string, User> = {
  '1': { id: '1', email: 'admin@vaultkey.com', name: '系统管理员', role: 'admin', status: 'active', createdAt: '2024-01-01', lastLogin: '2025-07-15 10:30', vaultCount: 3, twoFactorEnabled: true, passkeyEnabled: true, travelModeEnabled: false, loginCount: 156, lastIP: '192.168.1.100' },
  '2': { id: '2', email: 'zhangsan@example.com', name: '张三', role: 'user', status: 'active', createdAt: '2024-03-15', lastLogin: '2025-07-15 09:15', vaultCount: 2, twoFactorEnabled: true, passkeyEnabled: false, travelModeEnabled: false, loginCount: 89, lastIP: '10.0.0.55' },
  '3': { id: '3', email: 'lisi@example.com', name: '李四', role: 'user', status: 'active', createdAt: '2024-05-20', lastLogin: '2025-07-14 16:45', vaultCount: 1, twoFactorEnabled: false, passkeyEnabled: false, travelModeEnabled: true, loginCount: 42, lastIP: '172.16.0.23' },
  '4': { id: '4', email: 'wangwu@example.com', name: '王五', role: 'user', status: 'inactive', createdAt: '2024-06-10', lastLogin: '2025-06-20 11:00', vaultCount: 1, twoFactorEnabled: false, passkeyEnabled: false, travelModeEnabled: false, loginCount: 23, lastIP: '192.168.0.88' },
  '5': { id: '5', email: 'chenliu@example.com', name: '陈六', role: 'user', status: 'pending', createdAt: '2025-07-14', lastLogin: '-', vaultCount: 0, twoFactorEnabled: false, passkeyEnabled: false, travelModeEnabled: false, loginCount: 0, lastIP: '-' },
};

const mockVaults: Record<string, VaultInfo[]> = {
  '1': [
    { id: 'v1', name: '个人保险库', itemCount: 25, shared: false, createdAt: '2024-01-01' },
    { id: 'v2', name: '工作保险库', itemCount: 18, shared: true, createdAt: '2024-02-15' },
    { id: 'v3', name: '家庭保险库', itemCount: 12, shared: true, createdAt: '2024-06-20' },
  ],
  '2': [
    { id: 'v4', name: '我的保险库', itemCount: 45, shared: false, createdAt: '2024-03-15' },
    { id: 'v5', name: '团队共享', itemCount: 20, shared: true, createdAt: '2024-08-10' },
  ],
  '3': [
    { id: 'v6', name: '默认保险库', itemCount: 30, shared: false, createdAt: '2024-05-20' },
  ],
  '4': [
    { id: 'v7', name: '个人收藏', itemCount: 5, shared: false, createdAt: '2024-06-10' },
  ],
  '5': [],
};

const mockActivityLogs: Record<string, ActivityLog[]> = {
  '1': [
    { id: 'a1', action: '登录系统', timestamp: '2025-07-15 10:30:22', ip: '192.168.1.100', device: 'Chrome 126 on Windows 11' },
    { id: 'a2', action: '查看保险库', timestamp: '2025-07-15 10:31:15', ip: '192.168.1.100', device: 'Chrome 126 on Windows 11' },
    { id: 'a3', action: '添加密码', timestamp: '2025-07-15 10:35:44', ip: '192.168.1.100', device: 'Chrome 126 on Windows 11' },
    { id: 'a4', action: '修改设置', timestamp: '2025-07-14 16:20:10', ip: '192.168.1.100', device: 'Safari on macOS' },
    { id: 'a5', action: '导出数据', timestamp: '2025-07-13 09:15:33', ip: '10.0.0.50', device: 'Firefox on Linux' },
  ],
  '2': [
    { id: 'a6', action: '登录系统', timestamp: '2025-07-15 09:15:08', ip: '10.0.0.55', device: 'Edge on Windows 10' },
    { id: 'a7', action: '复制密码', timestamp: '2025-07-15 09:20:33', ip: '10.0.0.55', device: 'Edge on Windows 10' },
    { id: 'a8', action: '更新密码', timestamp: '2025-07-14 14:45:12', ip: '10.0.0.55', device: 'Chrome on Android' },
  ],
  '3': [
    { id: 'a9', action: '登录系统', timestamp: '2025-07-14 16:45:55', ip: '172.16.0.23', device: 'Safari on iPhone' },
    { id: 'a10', action: '启用旅行模式', timestamp: '2025-07-14 16:48:20', ip: '172.16.0.23', device: 'Safari on iPhone' },
  ],
  '4': [
    { id: 'a11', action: '登录系统', timestamp: '2025-06-20 11:00:30', ip: '192.168.0.88', device: 'Chrome on macOS' },
    { id: 'a12', action: '查看保险库', timestamp: '2025-06-20 11:05:18', ip: '192.168.0.88', device: 'Chrome on macOS' },
  ],
  '5': [],
};

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const user = mockUsers[userId || ''] || null;
  const vaults = mockVaults[userId || ''] || [];
  const activityLogs = mockActivityLogs[userId || ''] || [];

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: 'user' as 'admin' | 'user', status: 'active' as 'active' | 'inactive' | 'pending' });

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-vault-text-muted">用户不存在</p>
        </div>
      </AdminLayout>
    );
  }

  const handleStartEdit = () => {
    setEditForm({ name: user.name, role: user.role, status: user.status });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name) {
      toast.error('请填写用户名');
      return;
    }
    toast.success('用户信息已更新');
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    toast.success(`用户已${newStatus === 'active' ? '激活' : '禁用'}`);
  };

  const handleResetPassword = () => {
    if (confirm('确定要重置该用户的密码吗？用户将收到重置邮件。')) {
      toast.success('密码重置邮件已发送');
    }
  };

  const handleDeleteUser = () => {
    if (confirm('确定要删除该用户吗？此操作不可撤销。')) {
      toast.success('用户已删除');
      navigate('/admin/users');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 rounded-lg hover:bg-vault-hover transition-colors"
          >
            <ArrowLeft size={20} className="text-vault-text-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-vault-text">{user.name}</h1>
            <p className="text-sm text-vault-text-muted">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="vault-btn-secondary text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="vault-btn-primary text-sm"
                >
                  保存
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleToggleStatus}
                  className={cn(
                    'vault-btn-secondary text-sm',
                    user.status === 'active' ? 'text-vault-warn' : 'text-vault-success'
                  )}
                >
                  {user.status === 'active' ? '禁用' : '激活'}
                </button>
                <button
                  onClick={handleStartEdit}
                  className="vault-btn-primary text-sm flex items-center gap-1"
                >
                  <Edit size={14} />
                  编辑
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="p-2 rounded-lg text-vault-error hover:bg-vault-error/10 transition-colors"
                  title="删除用户"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 用户基本信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：概览卡片 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息卡片 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4 flex items-center gap-2">
                <User size={16} className="text-vault-accent" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">用户名</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="vault-input text-sm"
                    />
                  ) : (
                    <p className="text-sm text-vault-text">{user.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">邮箱</span>
                  <p className="text-sm text-vault-text flex items-center gap-2">
                    <Mail size={14} className="text-vault-text-muted" />
                    {user.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">角色</span>
                  {isEditing ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                      className="vault-input text-sm"
                    >
                      <option value="admin">管理员</option>
                      <option value="user">普通用户</option>
                    </select>
                  ) : (
                    <span className={cn(
                      'vault-badge',
                      user.role === 'admin' ? 'bg-vault-accent/20 text-vault-accent' : 'bg-vault-success/20 text-vault-success'
                    )}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">状态</span>
                  {isEditing ? (
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' | 'pending' })}
                      className="vault-input text-sm"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">禁用</option>
                      <option value="pending">待审核</option>
                    </select>
                  ) : (
                    <span className={cn(
                      'vault-badge',
                      user.status === 'active' ? 'bg-vault-success/20 text-vault-success' :
                      user.status === 'inactive' ? 'bg-vault-error/20 text-vault-error' :
                      'bg-vault-warn/20 text-vault-warn'
                    )}>
                      {user.status === 'active' ? '活跃' : user.status === 'inactive' ? '禁用' : '待审核'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 安全设置 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4 flex items-center gap-2">
                <Shield size={16} className="text-vault-accent" />
                安全设置
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vault-text-secondary flex items-center gap-2">
                    <Lock size={14} className="text-vault-text-muted" />
                    双因素认证
                  </span>
                  {user.twoFactorEnabled ? (
                    <span className="vault-badge bg-vault-success/20 text-vault-success text-xs">已启用</span>
                  ) : (
                    <span className="vault-badge bg-vault-error/20 text-vault-error text-xs">未启用</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vault-text-secondary flex items-center gap-2">
                    <KeyRound size={14} className="text-vault-text-muted" />
                    通行密钥
                  </span>
                  {user.passkeyEnabled ? (
                    <span className="vault-badge bg-vault-success/20 text-vault-success text-xs">已启用</span>
                  ) : (
                    <span className="vault-badge bg-vault-error/20 text-vault-error text-xs">未启用</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vault-text-secondary flex items-center gap-2">
                    <RefreshCw size={14} className="text-vault-text-muted" />
                    旅行模式
                  </span>
                  {user.travelModeEnabled ? (
                    <span className="vault-badge bg-vault-warn/20 text-vault-warn text-xs">已启用</span>
                  ) : (
                    <span className="vault-badge bg-vault-text-muted/20 text-vault-text-muted text-xs">未启用</span>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-vault-border">
                <button
                  onClick={handleResetPassword}
                  className="text-sm text-vault-accent hover:text-vault-accent/80 transition-colors"
                >
                  重置密码
                </button>
              </div>
            </div>

            {/* 保险库列表 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4 flex items-center gap-2">
                <FileText size={16} className="text-vault-accent" />
                保险库 ({vaults.length})
              </h3>
              {vaults.length > 0 ? (
                <div className="space-y-3">
                  {vaults.map((vault) => (
                    <div key={vault.id} className="flex items-center justify-between p-3 bg-vault-surface rounded-lg">
                      <div>
                        <p className="text-sm text-vault-text">{vault.name}</p>
                        <p className="text-xs text-vault-text-muted">
                          {vault.itemCount} 个项目 · 创建于 {vault.createdAt}
                        </p>
                      </div>
                      {vault.shared && (
                        <span className="vault-badge bg-vault-accent/20 text-vault-accent text-xs">共享</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-vault-text-muted">暂无保险库</p>
              )}
            </div>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4">统计信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-vault-surface rounded-lg">
                  <p className="text-2xl font-bold text-vault-accent">{user.vaultCount}</p>
                  <p className="text-xs text-vault-text-muted mt-1">保险库数</p>
                </div>
                <div className="text-center p-3 bg-vault-surface rounded-lg">
                  <p className="text-2xl font-bold text-vault-success">{user.loginCount}</p>
                  <p className="text-xs text-vault-text-muted mt-1">登录次数</p>
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-vault-accent" />
                时间信息
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">注册时间</span>
                  <p className="text-sm text-vault-text">{user.createdAt}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">最后登录</span>
                  <p className="text-sm text-vault-text">{user.lastLogin}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-vault-text-muted">最后IP</span>
                  <p className="text-sm text-vault-text font-mono">{user.lastIP}</p>
                </div>
              </div>
            </div>

            {/* 最近活动 */}
            <div className="vault-card p-6">
              <h3 className="text-sm font-medium text-vault-text mb-4">最近活动</h3>
              {activityLogs.length > 0 ? (
                <div className="space-y-2">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs">
                      <p className="text-vault-text">{log.action}</p>
                      <p className="text-vault-text-muted mt-0.5">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-vault-text-muted">暂无活动记录</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}