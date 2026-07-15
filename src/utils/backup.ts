/**
 * 自动备份工具 - 定期将数据快照保存到 localStorage
 */

import type { VaultItem, Vault, Folder } from '@/types';

const BACKUP_KEY = 'vaultkey-backups';
const MAX_BACKUPS = 10;

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  items: VaultItem[];
  vaults: Vault[];
  folders: Folder[];
  itemCount: number;
  vaultCount: number;
}

/**
 * 创建当前数据的备份快照
 */
export function createBackup(
  items: VaultItem[],
  vaults: Vault[],
  folders: Folder[],
): BackupSnapshot {
  return {
    id: `backup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    items: JSON.parse(JSON.stringify(items)),
    vaults: JSON.parse(JSON.stringify(vaults)),
    folders: JSON.parse(JSON.stringify(folders)),
    itemCount: items.length,
    vaultCount: vaults.length,
  };
}

/**
 * 获取所有备份列表
 */
export function getBackups(): BackupSnapshot[] {
  try {
    const data = localStorage.getItem(BACKUP_KEY);
    if (!data) return [];
    const backups: BackupSnapshot[] = JSON.parse(data);
    return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

/**
 * 保存备份到 localStorage（保留最近的 MAX_BACKUPS 个）
 */
export function saveBackup(snapshot: BackupSnapshot): void {
  try {
    const backups = getBackups();
    backups.unshift(snapshot);
    // 保留最多 MAX_BACKUPS 个备份
    const trimmed = backups.slice(0, MAX_BACKUPS);
    localStorage.setItem(BACKUP_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('保存备份失败:', e);
  }
}

/**
 * 删除指定备份
 */
export function deleteBackup(backupId: string): void {
  const backups = getBackups();
  const filtered = backups.filter((b) => b.id !== backupId);
  localStorage.setItem(BACKUP_KEY, JSON.stringify(filtered));
}

/**
 * 清空所有备份
 */
export function clearAllBackups(): void {
  localStorage.removeItem(BACKUP_KEY);
}

/**
 * 获取指定备份
 */
export function getBackupById(backupId: string): BackupSnapshot | null {
  const backups = getBackups();
  return backups.find((b) => b.id === backupId) || null;
}

/**
 * 下载备份为 JSON 文件
 */
export function downloadBackup(snapshot: BackupSnapshot): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date(snapshot.createdAt).toISOString().slice(0, 19).replace(/[:.]/g, '-');
  a.download = `vaultkey-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 格式化备份时间为可读字符串
 */
export function formatBackupTime(isoTime: string): string {
  const date = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleString();
}
