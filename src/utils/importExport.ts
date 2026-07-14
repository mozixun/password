/**
 * 导入导出工具 - 支持多种密码管理器格式
 */

import type { VaultItem, ItemType } from '@/types';

// ==================== 导出功能 ====================

/**
 * 将条目导出为CSV格式
 */
export function exportToCSV(items: VaultItem[]): string {
  const headers = [
    '类型',
    '标题',
    '用户名',
    '密码',
    'URL',
    '备注',
    '标签',
    '创建时间',
    '更新时间',
  ];

  const rows = items.map((item) => {
    const typeLabels: Record<ItemType, string> = {
      login: '登录',
      credit_card: '信用卡',
      identity: '身份',
      note: '安全笔记',
      ssh_key: 'SSH密钥',
      document: '文档',
      passkey: '通行密钥',
      totp_authenticator: '验证器',
      license: 'License',
      id_card: '身份证',
      database: '数据库',
      api_key: 'API Key',
    };

    return [
      typeLabels[item.type] || item.type,
      escapeCSV(item.title),
      escapeCSV(item.username || item.email || ''),
      escapeCSV(item.password || ''),
      escapeCSV(item.url || ''),
      escapeCSV(item.notes || ''),
      escapeCSV(item.tags?.join(', ') || ''),
      item.createdAt,
      item.updatedAt,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * 将条目导出为JSON格式（VaultKey原生格式）
 */
export function exportToJSON(items: VaultItem[]): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items,
    },
    null,
    2
  );
}

/**
 * 将条目导出为1Password CSV格式
 */
export function exportTo1PasswordCSV(items: VaultItem[]): string {
  const headers = [
    'Title',
    'URL',
    'Username',
    'Password',
    'Notes',
    'Tags',
  ];

  const rows = items.map((item) => {
    let notes = item.notes || '';
    if (item.cardNumber) notes += `\n卡号: ${item.cardNumber}`;
    if (item.cardholderName) notes += `\n持卡人: ${item.cardholderName}`;
    if (item.expiryDate) notes += `\n有效期: ${item.expiryDate}`;

    return [
      escapeCSV(item.title),
      escapeCSV(item.url || ''),
      escapeCSV(item.username || item.email || ''),
      escapeCSV(item.password || ''),
      escapeCSV(notes),
      escapeCSV(item.tags?.join(',') || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ==================== 导入功能 ====================

/**
 * 从CSV文件导入条目
 */
export function importFromCSV(csvContent: string): VaultItem[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const items: VaultItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const item = parseCSVRowToItem(row);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * 从Bitwarden JSON格式导入条目
 */
export function importFromBitwardenJSON(jsonContent: string): VaultItem[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items
      .map((item: Record<string, unknown>) => parseBitwardenItem(item))
      .filter((item: VaultItem | null) => item !== null);
  } catch {
    return [];
  }
}

/**
 * 从1Password CSV格式导入条目
 */
export function importFrom1PasswordCSV(csvContent: string): VaultItem[] {
  return importFromCSV(csvContent);
}

/**
 * 从VaultKey JSON格式导入条目
 */
export function importFromVaultKeyJSON(jsonContent: string): VaultItem[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.items || !Array.isArray(data.items)) return [];
    return data.items;
  } catch {
    return [];
  }
}

// ==================== 辅助函数 ====================

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

function parseCSVRowToItem(row: Record<string, string>): VaultItem | null {
  const title = row.Title || row.title || row['标题'] || '';
  if (!title) return null;

  const typeLabels: Record<string, ItemType> = {
    '登录': 'login',
    '信用卡': 'credit_card',
    '身份': 'identity',
    '安全笔记': 'note',
    'SSH密钥': 'ssh_key',
    '文档': 'document',
    '通行密钥': 'passkey',
    '验证器': 'totp_authenticator',
    'License': 'license',
    '身份证': 'id_card',
    '数据库': 'database',
    'API Key': 'api_key',
  };

  let type: ItemType = 'login';
  const typeStr = row.Type || row.type || row['类型'] || '';
  if (typeLabels[typeStr]) {
    type = typeLabels[typeStr];
  } else if (typeStr.toLowerCase().includes('card')) {
    type = 'credit_card';
  } else if (typeStr.toLowerCase().includes('note')) {
    type = 'note';
  }

  const now = new Date().toISOString();

  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vaultId: 'default',
    type,
    title,
    username: row.Username || row.username || row['用户名'] || '',
    password: row.Password || row.password || row['密码'] || '',
    url: row.URL || row.url || row['URL'] || '',
    notes: row.Notes || row.notes || row['备注'] || '',
    tags: (row.Tags || row.tags || row['标签'] || '')
      .split(/[,，]/)
      .map((t: string) => t.trim())
      .filter(Boolean) as string[],
    favorite: false,
    createdAt: row['创建时间'] || now,
    updatedAt: row['更新时间'] || now,
  };
}

function parseBitwardenItem(item: Record<string, unknown>): VaultItem | null {
  if (!item.name) return null;

  let type: ItemType = 'login';

  if (item.type === 2) {
    type = 'credit_card';
  } else if (item.type === 3) {
    type = 'note';
  } else if (item.type === 1) {
    type = 'login';
  }

  const now = new Date().toISOString();
  const login = (item.login as Record<string, unknown>) || {};
  const card = (item.card as Record<string, unknown>) || {};

  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vaultId: 'default',
    type,
    title: String(item.name),
    username: String(login.username || ''),
    password: String(login.password || ''),
    url: String((login.uris as Array<{ uri: string }>)?.[0]?.uri || ''),
    notes: String(item.notes || ''),
    tags: (item.tags as string[]) || [],
    favorite: item.favorite === true,
    cardNumber: String(card.number || ''),
    cardholderName: String(card.cardholderName || ''),
    expiryDate: card.expMonth && card.expYear
      ? `${card.expYear}-${String(card.expMonth).padStart(2, '0')}`
      : '',
    createdAt: new Date(String(item.createdAt || now)).toISOString(),
    updatedAt: new Date(String(item.updatedAt || now)).toISOString(),
  };
}

/**
 * 检测文件格式
 */
export function detectFormat(content: string): 'csv' | 'json-bitwarden' | 'json-vaultkey' | 'unknown' {
  if (content.trim().startsWith('{')) {
    try {
      const data = JSON.parse(content);
      if (data.items && Array.isArray(data.items)) {
        if (data.items[0]?.type === 1 || data.items[0]?.type === 2 || data.items[0]?.type === 3) {
          return 'json-bitwarden';
        }
        if (data.version || data.items[0]?.type === 'login') {
          return 'json-vaultkey';
        }
      }
      return 'json-bitwarden';
    } catch {
      return 'unknown';
    }
  }
  if (content.includes(',')) {
    return 'csv';
  }
  return 'unknown';
}

/**
 * 统一导入入口
 */
export function importData(content: string, format: string): VaultItem[] {
  switch (format.toLowerCase()) {
    case 'csv':
      return importFromCSV(content);
    case '1password':
      return importFrom1PasswordCSV(content);
    case 'bitwarden':
      return importFromBitwardenJSON(content);
    case 'json':
      return importFromVaultKeyJSON(content);
    default: {
      const detected = detectFormat(content);
      if (detected === 'csv') return importFromCSV(content);
      if (detected === 'json-bitwarden') return importFromBitwardenJSON(content);
      if (detected === 'json-vaultkey') return importFromVaultKeyJSON(content);
      return [];
    }
  }
}
