import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Shield, Calendar, Lock, Check, X, Crown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from '@/components/Toast';
import { useStore } from '@/store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
  vaultCount: number;
  twoFactorEnabled: boolean;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const admin = useStore((state) => state.admin);
  const canDelete = admin.canDeleteUser();
  const canManage = admin.canManageAdmins();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'admin@vaultkey.com', name: '系统管理员', role: 'super_admin', status: 'active', createdAt: '2024-01-01', lastLogin: '2025-07-15 10:30', vaultCount: 3, twoFactorEnabled: true },
    { id: '2', email: 'zhangsan@example.com', name: '张三', role: 'admin', status: 'active', createdAt: '2024-03-15', lastLogin: '2025-07-15 09:15', vaultCount: 2, twoFactorEnabled: true },
    { id: '3', email: 'lisi@example.com', name: '李四', role: 'user', status: 'active', createdAt: '2024-05-20', lastLogin: '2025-07-14 16:45', vaultCount: 1, twoFactorEnabled: false },
    { id: '4', email: 'wangwu@example.com', name: '王五', role: 'user', status: 'inactive', createdAt: '2024-06-10', lastLogin: '2025-06-20 11:00', vaultCount: 1, twoFactorEnabled: false },
    { id: '5', email: 'chenliu@example.com', name: '陈六', role: 'user', status: 'pending', createdAt: '2025-07-14', lastLogin: '-', vaultCount: 0, twoFactorEnabled: false },
  ]);

  type UserRole = 'user' | 'admin' | 'super_admin';
  const [addForm, setAddForm] = useState({ email: '', name: '', role: 'user' as UserRole });
  const [editForm, setEditForm] = useState({ email: '', name: '', role: 'user' as UserRole, status: 'active' as 'active' | 'inactive' | 'pending' });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDelete = (userId: string) => {
    if (confirm('确定要删除该用户吗？')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({ email: user.email, name: user.name, role: user.role, status: user.status });
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    if (!addForm.email || !addForm.name) {
      toast.error('请填写完整信息');
      return;
    }
    const newUser: User = {
      id: Date.now().toString(),
      email: addForm.email,
      name: addForm.name,
      role: addForm.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-',
      vaultCount: 0,
      twoFactorEnabled: false,
    };
    setUsers([newUser, ...users]);
    setAddForm({ email: '', name: '', role: 'user' });
    setShowAddModal(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.email || !editForm.name) {
      toast.error('请填写完整信息');
      return;
    }
    setUsers(users.map(user => 
      user.id === selectedUser?.id 
        ? { ...user, email: editForm.email, name: editForm.name, role: editForm.role, status: editForm.status }
        : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-slate-500',
    pending: 'bg-yellow-500',
  };

  const statusLabels = {
    active: '活跃',
    inactive: '停用',
    pending: '待审核',
  };

  return (
    <AdminLayout>
      <div className="h-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">用户管理</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-400 text-sm">管理系统用户和权限</span>
              <span className="text-xs">·</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                admin.currentRole === 'super_admin'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : admin.currentRole === 'admin'
                  ? 'bg-vault-accent/20 text-vault-accent'
                  : 'bg-slate-700 text-slate-300'
              )}>
                {admin.currentRole === 'super_admin' ? '超级管理员' : admin.currentRole === 'admin' ? '管理员' : '版主'}
              </span>
              {!canManage && (
                <span className="text-[10px] text-slate-500">(部分功能受限)</span>
              )}
            </div>
          </div>
          <button
            className="bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl px-4 py-2 flex items-center gap-2 transition-all"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            添加用户
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索用户邮箱或姓名..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent transition-colors"
              >
                <option value="all">全部角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="admin">管理员</option>
                <option value="user">普通用户</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent transition-colors"
              >
                <option value="all">全部状态</option>
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
                <option value="pending">待审核</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">用户信息</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">角色</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">状态</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">保险库</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">2FA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">创建时间</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-vault-accent/20 flex items-center justify-center">
                          <span className="text-vault-accent text-xs font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1',
                        user.role === 'super_admin'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : user.role === 'admin'
                          ? 'bg-vault-accent/10 text-vault-accent'
                          : 'bg-slate-700 text-slate-300'
                      )}>
                        {user.role === 'super_admin' && <Crown size={12} />}
                        {user.role === 'admin' && <Shield size={12} />}
                        {user.role === 'super_admin' ? '超级管理员' : user.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', statusColors[user.status])} />
                        <span className="text-sm text-slate-300">{statusLabels[user.status]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-300">{user.vaultCount}</span>
                    </td>
                    <td className="px-4 py-4">
                      {user.twoFactorEnabled ? (
                        <div className="flex items-center gap-1.5 text-green-400">
                          <Check size={14} />
                          <span className="text-xs">已启用</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <X size={14} />
                          <span className="text-xs">未启用</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">{user.createdAt}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={14} />
                        </button>
                        {(canManage || user.role === 'user') && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                            title="编辑"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && user.role !== 'super_admin' && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">未找到匹配的用户</p>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">添加新用户</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">邮箱地址</label>
                  <input 
                    type="email" 
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent" 
                    placeholder="user@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">姓名</label>
                  <input 
                    type="text" 
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent" 
                    placeholder="用户名" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">角色</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent"
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                    {canManage && <option value="super_admin">超级管理员</option>}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl py-2.5 transition-colors" onClick={() => setShowAddModal(false)}>取消</button>
                <button className="flex-1 bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl py-2.5 transition-colors" onClick={handleAddUser}>创建用户</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">编辑用户</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">邮箱地址</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">姓名</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">角色</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent"
                  >
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                    {canManage && <option value="super_admin">超级管理员</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">状态</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' | 'pending' })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-vault-accent"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">停用</option>
                    <option value="pending">待审核</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl py-2.5 transition-colors" onClick={() => setShowEditModal(false)}>取消</button>
                <button className="flex-1 bg-vault-accent hover:bg-vault-accent-hover text-white font-medium rounded-xl py-2.5 transition-colors" onClick={handleSaveEdit}>保存更改</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
