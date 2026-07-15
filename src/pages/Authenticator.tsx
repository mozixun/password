import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Plus,
  Search,
  Clock,
  Shield,
} from 'lucide-react';
import { useStore } from '@/store';
import type { VaultItem, TOTPConfig } from '@/types';
import { generateTOTP, getRemainingSeconds } from '@/utils/totp';
import CopyButton from '@/components/CopyButton';
import AppLayout from '@/components/AppLayout';
import { cn } from '@/lib/utils';

interface TOTPItem extends VaultItem {
  totpConfig: TOTPConfig;
  currentCode: string;
  remainingSeconds: number;
}

export default function Authenticator() {
  const navigate = useNavigate();
  const items = useStore((s) => s.items.list);
  const [searchQuery, setSearchQuery] = useState('');
  const [totpItems, setTotpItems] = useState<TOTPItem[]>([]);

  // 筛选 TOTP 验证器项目
  const filteredItems = items.filter(
    (item) => item.type === 'totp_authenticator' || (item.type === 'login' && item.totp)
  );

  // 更新 TOTP 验证码
  const updateCodes = useCallback(async () => {
    const updatedItems: TOTPItem[] = await Promise.all(
      filteredItems.map(async (item) => {
        let config: TOTPConfig;
        
        if (item.type === 'totp_authenticator' && item.totpConfig) {
          config = item.totpConfig;
        } else if (item.type === 'login' && item.totp) {
          // 兼容旧格式：从 totp 字段解析
          config = {
            secret: item.totp,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
          };
        } else {
          // 跳过无效项
          return {
            ...item,
            totpConfig: { secret: '', algorithm: 'SHA1', digits: 6, period: 30 },
            currentCode: '------',
            remainingSeconds: 30,
          } as TOTPItem;
        }

        try {
          const code = await generateTOTP(config);
          return {
            ...item,
            totpConfig: config,
            currentCode: code,
            remainingSeconds: getRemainingSeconds(config.period),
          } as TOTPItem;
        } catch {
          return {
            ...item,
            totpConfig: config,
            currentCode: '------',
            remainingSeconds: 30,
          } as TOTPItem;
        }
      })
    );
    
    setTotpItems(updatedItems);
  }, [filteredItems]);

  // 初始化和定时更新
  useEffect(() => {
    updateCodes();
    const interval = setInterval(updateCodes, 1000);
    return () => clearInterval(interval);
  }, [updateCodes]);

  // 搜索过滤
  const displayedItems = totpItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.totpConfig.issuer?.toLowerCase().includes(query) ||
      item.totpConfig.account?.toLowerCase().includes(query) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // 格式化验证码（每3位一组）
  const formatCode = (code: string): [string, string] => {
    if (code.length === 6) {
      return [code.slice(0, 3), code.slice(3)];
    }
    if (code.length === 8) {
      return [code.slice(0, 4), code.slice(4)];
    }
    return [code, ''];
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="shrink-0 px-8 pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vault-purple/15 rounded-lg">
                <Smartphone size={24} className="text-vault-purple" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-vault-text">
                  TOTP 验证器
                </h1>
                <p className="text-sm text-vault-text-secondary">
                  两步验证码实时生成
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/items/new?type=totp_authenticator')}
              className="vault-btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              添加验证器
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-text-muted" />
            <input
              type="text"
              placeholder="搜索验证器..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vault-input w-full pl-11"
            />
          </div>
        </div>

        {/* 验证器列表 */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-vault-text-muted">
              <Shield size={48} className="mb-4 opacity-30" />
              <p className="text-lg mb-2">没有找到验证器</p>
              <p className="text-sm">点击上方按钮添加新的 TOTP 验证器</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedItems.map((item) => {
                const [code1, code2] = formatCode(item.currentCode);
                const progress = Math.max(0, Math.min(100, ((item.totpConfig.period - item.remainingSeconds) / item.totpConfig.period) * 100));
                const isExpiring = item.remainingSeconds <= 5;

                return (
                  <div
                    key={item.id}
                    className="vault-card p-5 group cursor-pointer hover:scale-[1.02] transition-all"
                    onClick={() => navigate(`/items/detail/${item.id}`)}
                  >
                    {/* 标题行 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-vault-purple/15 flex items-center justify-center">
                          <span className="text-lg font-semibold text-vault-purple">
                            {item.totpConfig.issuer?.charAt(0) || item.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-vault-text">
                            {item.totpConfig.issuer || item.title}
                          </h3>
                          {item.totpConfig.account && (
                            <p className="text-xs text-vault-text-muted">
                              {item.totpConfig.account}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.favorite && (
                          <span className="text-vault-orange">★</span>
                        )}
                      </div>
                    </div>

                    {/* 验证码显示 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-mono text-3xl tracking-widest font-bold',
                            isExpiring ? 'text-vault-warn' : 'text-vault-text'
                          )}
                        >
                          {code1}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-3xl tracking-widest font-bold',
                            isExpiring ? 'text-vault-warn' : 'text-vault-text'
                          )}
                        >
                          {code2}
                        </span>
                      </div>
                      <CopyButton value={item.currentCode} />
                    </div>

                    {/* 进度条和时间 */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-vault-border rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            isExpiring ? 'bg-vault-warn' : 'bg-vault-accent'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-vault-text-muted">
                        <Clock size={14} />
                        <span className="text-xs font-mono">
                          {item.remainingSeconds}s
                        </span>
                      </div>
                    </div>

                    {/* 算法标识 */}
                    {item.totpConfig.algorithm !== 'SHA1' && (
                      <div className="mt-3 flex items-center gap-1">
                        <span className="vault-badge bg-vault-accent/10 text-vault-accent">
                          {item.totpConfig.algorithm}
                        </span>
                        {item.totpConfig.digits !== 6 && (
                          <span className="vault-badge bg-vault-blue/10 text-vault-blue">
                            {item.totpConfig.digits}位
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="shrink-0 px-8 pb-6">
          <div className="flex items-center gap-2 text-xs text-vault-text-muted bg-vault-surface/50 rounded-lg px-4 py-2">
            <Shield size={14} />
            <span>
              验证码每 {totpItems[0]?.totpConfig.period || 30} 秒自动刷新，请勿分享给他人
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}