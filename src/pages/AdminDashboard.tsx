import { useState } from 'react';
import { TrendingUp, Users, Lock, Shield, Activity, Server } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [stats] = useState({
    totalUsers: 128,
    activeUsers: 45,
    vaults: 256,
    items: 1842,
    avgPasswordStrength: 82,
    twoFactorEnabled: 76,
  });

  const statCards = [
    {
      icon: Users,
      label: '总用户数',
      value: stats.totalUsers,
      change: '+12%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Activity,
      label: '活跃用户',
      value: stats.activeUsers,
      change: '+5%',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Server,
      label: '保管库数',
      value: stats.vaults,
      change: '+8%',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Lock,
      label: '密码条目',
      value: stats.items,
      change: '+15%',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Shield,
      label: '平均密码强度',
      value: `${stats.avgPasswordStrength}%`,
      change: '良好',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
    {
      icon: TrendingUp,
      label: '2FA启用率',
      value: `${stats.twoFactorEnabled}%`,
      change: '+3%',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <AdminLayout>
      <div className="h-full animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">管理仪表盘</h1>
            <p className="text-slate-400 text-sm mt-1">系统概览和关键指标</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">最后更新</p>
            <p className="text-sm text-slate-300">{new Date().toLocaleString('zh-CN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : stat.change === '良好' ? 'text-teal-400' : 'text-slate-500'}`}>
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">最近活动</h2>
            <div className="space-y-3">
              {[
                { action: '用户注册', user: 'zhangsan@example.com', time: '5分钟前', type: 'success' },
                { action: '密码修改', user: 'lisi@example.com', time: '12分钟前', type: 'info' },
                { action: '保管库创建', user: 'wangwu@example.com', time: '28分钟前', type: 'info' },
                { action: '2FA启用', user: 'zhangsan@example.com', time: '1小时前', type: 'success' },
                { action: '数据导出', user: 'chenliu@example.com', time: '2小时前', type: 'warning' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-green-400' : item.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-white">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.user} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">安全概览</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">弱密码检测</span>
                  <span className="text-sm text-white">12 个</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-1/4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">重复密码</span>
                  <span className="text-sm text-white">8 组</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-1/6" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">泄露检测</span>
                  <span className="text-sm text-white">0 个</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-0" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">过期凭证</span>
                  <span className="text-sm text-white">5 个</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-1/8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
