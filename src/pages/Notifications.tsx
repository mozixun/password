import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  ShieldAlert,
  CreditCard,
  Info,
  CheckCircle2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useNotifications } from '@/store';
import { cn } from '@/lib/utils';

type NotificationType = 'subscription' | 'security' | 'system';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'subscription':
      return <CreditCard size={18} className="text-vault-accent" />;
    case 'security':
      return <ShieldAlert size={18} className="text-vault-warn" />;
    case 'system':
      return <Info size={18} className="text-vault-blue" />;
    default:
      return <Bell size={18} className="text-vault-text-secondary" />;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有通知吗？')) {
      clearAll();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-vault-border/50 transition-colors"
            >
              <ArrowLeft size={20} className="text-vault-text-secondary" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-vault-text">通知中心</h1>
              <p className="text-vault-text-secondary mt-1">
                {unreadCount > 0 ? `${unreadCount} 条未读通知` : '暂无未读通知'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-vault-accent hover:bg-vault-accent/10 rounded-lg transition-colors"
                >
                  全部已读
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-vault-warn hover:bg-vault-warn/10 rounded-lg transition-colors"
                >
                  清空所有
                </button>
              </>
            )}
          </div>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-vault-accent text-white'
                : 'bg-vault-border/50 text-vault-text-secondary hover:bg-vault-border'
            )}
          >
            全部 ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('security')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'security'
                ? 'bg-vault-accent text-white'
                : 'bg-vault-border/50 text-vault-text-secondary hover:bg-vault-border'
            )}
          >
            安全提醒
          </button>
          <button
            onClick={() => setFilter('subscription')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'subscription'
                ? 'bg-vault-accent text-white'
                : 'bg-vault-border/50 text-vault-text-secondary hover:bg-vault-border'
            )}
          >
            订阅通知
          </button>
          <button
            onClick={() => setFilter('system')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'system'
                ? 'bg-vault-accent text-white'
                : 'bg-vault-border/50 text-vault-text-secondary hover:bg-vault-border'
            )}
          >
            系统消息
          </button>
        </div>

        {/* 通知列表 */}
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BellOff size={48} className="text-vault-border mb-4" />
            <p className="text-vault-text-secondary">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date}>
                <div className="text-xs font-medium text-vault-text-secondary uppercase tracking-wider mb-3 px-4">
                  {date}
                </div>
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      'vault-card p-4 cursor-pointer transition-colors',
                      !notification.read && 'border-l-4 border-vault-accent'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-vault-bg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className={cn(
                            'font-medium text-sm',
                            notification.read ? 'text-vault-text-secondary' : 'text-vault-text'
                          )}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-vault-text-secondary whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-vault-text-secondary mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="p-1.5 text-vault-text-secondary hover:text-vault-warn hover:bg-vault-warn/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
