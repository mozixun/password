import { useState } from 'react';
import { Search, Filter, Clock, User, Shield, FileText, ChevronDown } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'security';
  user: string;
  action: string;
  detail: string;
  timestamp: string;
  ip: string;
}

export default function AdminLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [logs] = useState<LogEntry[]>([
    { id: '1', type: 'login', user: 'zhangsan@example.com', action: '用户登录', detail: '成功登录系统', timestamp: '2025-07-15 10:30:25', ip: '192.168.1.100' },
    { id: '2', type: 'create', user: 'admin@vaultkey.com', action: '创建保险库', detail: '创建了保险库 "Work"', timestamp: '2025-07-15 10:25:18', ip: '192.168.1.101' },
    { id: '3', type: 'update', user: 'lisi@example.com', action: '修改密码', detail: '修改了网站 "example.com" 的密码', timestamp: '2025-07-15 09:45:33', ip: '192.168.1.102' },
    { id: '4', type: 'export', user: 'wangwu@example.com', action: '数据导出', detail: '导出了 CSV 格式数据', timestamp: '2025-07-15 09:15:47', ip: '192.168.1.103' },
    { id: '5', type: 'security', user: 'system', action: '安全告警', detail: '检测到弱密码: 用户名 "test@example.com"', timestamp: '2025-07-15 08:30:12', ip: '-' },
    { id: '6', type: 'login', user: 'chenliu@example.com', action: '用户登录', detail: '首次登录系统', timestamp: '2025-07-15 08:15:55', ip: '192.168.1.104' },
    { id: '7', type: 'logout', user: 'zhangsan@example.com', action: '用户登出', detail: '主动登出系统', timestamp: '2025-07-14 18:45:00', ip: '192.168.1.100' },
    { id: '8', type: 'import', user: 'admin@vaultkey.com', action: '数据导入', detail: '从 1Password 导入了 25 条密码', timestamp: '2025-07-14 16:20:33', ip: '192.168.1.101' },
  ]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeConfig = {
    login: { icon: User, color: 'text-green-400', bg: 'bg-green-500/10', label: '登录' },
    logout: { icon: User, color: 'text-slate-400', bg: 'bg-slate-500/10', label: '登出' },
    create: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '创建' },
    update: { icon: FileText, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: '更新' },
    delete: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10', label: '删除' },
    export: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', label: '导出' },
    import: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: '导入' },
    security: { icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', label: '安全' },
  };

  return (
    <AdminLayout>
      <div className="h-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">操作日志</h1>
            <p className="text-slate-400 text-sm mt-1">查看系统操作记录和安全事件</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="p-4 border-b border-slate-700/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索用户、操作或详情..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vault-accent transition-colors"
              />
            </div>
            <div className="relative">
              <button
                className="w-full md:w-auto bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white flex items-center justify-center gap-2 focus:outline-none focus:border-vault-accent transition-colors"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={16} />
                <span>{typeFilter === 'all' ? '全部类型' : typeConfig[typeFilter].label}</span>
                <ChevronDown size={14} />
              </button>
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10">
                  {['all', 'login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'security'].map((type) => (
                    <button
                      key={type}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                        typeFilter === type ? 'bg-vault-accent/10 text-vault-accent' : 'text-slate-400 hover:bg-slate-700'
                      }`}
                      onClick={() => {
                        setTypeFilter(type);
                        setShowFilterMenu(false);
                      }}
                    >
                      {type === 'all' ? '全部类型' : typeConfig[type as keyof typeof typeConfig].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-700/30">
            {filteredLogs.map((log) => {
              const config = typeConfig[log.type];
              const Icon = config.icon;
              return (
                <div key={log.id} className="px-4 py-4 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{log.action}</span>
                        <span className={cn('px-2 py-0.5 rounded text-xs', config.bg, config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{log.detail}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {log.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {log.timestamp}
                        </span>
                        <span>{log.ip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">未找到匹配的日志</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
