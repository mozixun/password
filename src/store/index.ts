// VaultKey 密码管理器 - 全局状态管理
import { create } from 'zustand';
import type {
  VaultItem,
  Vault,
  VaultMember,
  WatchtowerSummary,
  SecurityAlert,
  Device,
  UserProfile,
  Folder,
  VaultSettings,
  RecoveryKey,
  EmergencyAccess,
  PasswordStrength,
  GeneratedPasswordHistory,
  AdminSettings,
  Attachment,
  ShareRecord,
  VaultKey as VaultKeyType,
  Subscription,
  RedeemCode,
  Notification,
  NotificationSettings,
} from '@/types';
import { checkEmailBreaches, checkPasswordLeak, type BreachResult } from '@/utils/breachDetection';
import {
  generateSecureKey,
  parseSecureKey,
  generateSaltA,
  generateSaltB,
  deriveK1,
  deriveVaultKey,
  decryptAESGCM,
  hashSHA256,
  generateDeviceId,
  bytesToBase64,
  bytesToHex,
  base64ToBytes,
  getRandomValues,
} from '@/utils/crypto';

// ==================== 各切片状态接口定义 ====================

interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  email: string;
  saltA: string;
  saltB: string;
  k1Hash: string;
  secureKeyBase32: string;
  vaultKey: VaultKeyType | null;
  failedAttempts: number;
  lastActivityTime: number;
  trustedDeviceId: string | null;
  login: (email: string, password: string, rememberDevice?: boolean) => Promise<void>;
  register: (email: string, password: string, rememberDevice?: boolean) => Promise<{ success: boolean; secureKey?: string }>;
  logout: () => void;
  lock: () => void;
  unlock: (password: string) => Promise<boolean>;
  unlockWithRecoveryKey: (recoveryKey: string) => Promise<boolean>;
  setTrustedDevice: (deviceId: string) => void;
  clearTrustedDevice: () => void;
  checkTrustedDevice: () => boolean;
  unlockWithTrustedDevice: () => Promise<boolean>;
  resetActivityTimer: () => void;
  checkAutoLock: () => void;
  initLocalKeyStorage: () => Promise<void>;
}

interface VaultsState {
  list: Vault[];
  currentVaultId: string;
  addVault: (vault: Omit<Vault, 'id' | 'itemCount' | 'createdAt' | 'updatedAt'>) => void;
  deleteVault: (vaultId: string) => void;
  updateVault: (vaultId: string, updates: Partial<Vault>) => void;
  setCurrentVault: (vaultId: string) => void;
  addVaultMember: (vaultId: string, email: string, role: 'admin' | 'member') => void;
  removeVaultMember: (vaultId: string, memberId: string) => void;
  updateVaultMemberRole: (vaultId: string, memberId: string, role: 'admin' | 'member') => void;
}

interface FoldersState {
  list: Folder[];
  currentFolderId: string | null;
  addFolder: (folder: Omit<Folder, 'id' | 'itemCount' | 'createdAt' | 'updatedAt'>) => void;
  deleteFolder: (folderId: string) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  setCurrentFolder: (folderId: string | null) => void;
}

interface ItemsState {
  list: VaultItem[];
  searchQuery: string;
  itemTypeFilter: string | null;
  tagFilter: string | null;
  selectedItemIds: string[];
  showTrashed: boolean;
  addItem: (item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteItem: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentDeleteItem: (id: string) => void;
  emptyTrash: () => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  restoreSelected: () => void;
  permanentDeleteSelected: () => void;
  moveSelected: (folderId: string) => void;
  exportSelected: () => string;
  setSearchQuery: (query: string) => void;
  setItemTypeFilter: (type: string | null) => void;
  setTagFilter: (tag: string | null) => void;
  setShowTrashed: (show: boolean) => void;
  incrementUsage: (id: string) => void;
  addAttachment: (itemId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  removeAttachment: (itemId: string, attachmentId: string) => void;
  rollbackPassword: (itemId: string, password: string) => void;
  shareItem: (itemId: string, email: string, permission: 'view' | 'edit') => void;
  unshareItem: (itemId: string, shareId: string) => void;
  updateSharePermission: (itemId: string, shareId: string, permission: 'view' | 'edit') => void;
}

interface WatchtowerState {
  summary: WatchtowerSummary;
  alerts: SecurityAlert[];
  breaches: BreachResult[];
  isCheckingBreach: boolean;
  lastBreachCheck: string | null;
  checkBreach: (email: string) => Promise<BreachResult[]>;
  checkPasswordLeak: (password: string) => Promise<{ found: boolean; count: number }>;
  runFullAudit: () => void;
}

interface GeneratorState {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  readable: boolean;
  passphrase: boolean;
  excludeAmbiguous: boolean;
  noConsecutive: boolean;
  noRepeat: boolean;
  generatedPassword: string;
  passwordStrength: PasswordStrength;
  history: GeneratedPasswordHistory[];
  setLength: (length: number) => void;
  setUppercase: (value: boolean) => void;
  setLowercase: (value: boolean) => void;
  setDigits: (value: boolean) => void;
  setSymbols: (value: boolean) => void;
  setReadable: (value: boolean) => void;
  setPassphrase: (value: boolean) => void;
  setExcludeAmbiguous: (value: boolean) => void;
  setNoConsecutive: (value: boolean) => void;
  setNoRepeat: (value: boolean) => void;
  generatePassword: () => void;
  calculateStrength: (password: string) => PasswordStrength;
  addToHistory: (password: string, type: 'password' | 'passphrase', length: number) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'zh' | 'en') => void;
}

interface SettingsState {
  settings: VaultSettings;
  recoveryKeys: RecoveryKey[];
  emergencyAccess: EmergencyAccess[];
  updateSettings: (updates: Partial<VaultSettings>) => void;
  toggleTravelMode: () => void;
  generateRecoveryKey: () => RecoveryKey;
  updateEmergencyAccess: (access: EmergencyAccess[]) => void;
  addAllowedDomain: (domain: string) => void;
  removeAllowedDomain: (domain: string) => void;
  addBlockedDomain: (domain: string) => void;
  removeBlockedDomain: (domain: string) => void;
  setMatchMode: (mode: 'exact' | 'fuzzy') => void;
}

interface ProfileState {
  profile: UserProfile;
  devices: Device[];
  removeDevice: (deviceId: string) => void;
}

interface AdminState {
  settings: AdminSettings;
  updateSiteInfo: (updates: Partial<AdminSettings['siteInfo']>) => void;
  generateRedeemCode: (planType: string, expiresAtDate: string, totalUses: number, subscriptionDays: number, customCode?: string) => RedeemCode;
  toggleRedeemCode: (id: string) => void;
  deleteRedeemCode: (id: string) => void;
  updateNotificationConfig: (config: Partial<NotificationSettings>) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

interface SubscriptionState {
  subscription: Subscription;
  applyRedeemCode: (code: string) => { success: boolean; message: string };
}

// ==================== 合并后的完整状态类型 ====================

interface StoreState {
  auth: AuthState;
  vaults: VaultsState;
  folders: FoldersState;
  items: ItemsState;
  watchtower: WatchtowerState;
  generator: GeneratorState;
  ui: UIState;
  settings: SettingsState;
  profile: ProfileState;
  admin: AdminState;
  notifications: NotificationState;
  subscription: SubscriptionState;
}

// ==================== 模拟数据 ====================

// 模拟保险库数据
const mockVaults: Vault[] = [
  {
    id: 'vault-personal',
    name: 'Personal',
    description: '个人账户和密码',
    icon: '🏠',
    color: '#3B82F6',
    itemCount: 20,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2025-07-10T14:30:00Z',
    isDefault: true,
    isHidden: false,
    members: [
      {
        id: 'member-owner',
        email: 'zhangsan@gmail.com',
        role: 'owner',
        createdAt: '2024-01-15T08:00:00Z',
      },
    ],
  },
  {
    id: 'vault-work',
    name: 'Work',
    description: '工作相关账户和凭证',
    icon: '💼',
    color: '#8B5CF6',
    itemCount: 10,
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2025-07-12T10:15:00Z',
    isDefault: false,
    isHidden: false,
    members: [
      {
        id: 'member-work-owner',
        email: 'zhangsan@gmail.com',
        role: 'owner',
        createdAt: '2024-03-20T09:00:00Z',
      },
      {
        id: 'member-work-admin',
        email: 'lisi@company.com',
        role: 'admin',
        createdAt: '2024-04-01T10:00:00Z',
      },
      {
        id: 'member-work-member',
        email: 'wangwu@company.com',
        role: 'member',
        createdAt: '2024-05-15T11:00:00Z',
      },
    ],
  },
];

// 模拟文件夹数据
const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    vaultId: 'vault-personal',
    name: '社交媒体',
    itemCount: 3,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
  },
  {
    id: 'folder-2',
    vaultId: 'vault-personal',
    name: '购物网站',
    itemCount: 2,
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2025-05-20T11:00:00Z',
  },
  {
    id: 'folder-3',
    vaultId: 'vault-work',
    name: '云服务',
    itemCount: 3,
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2025-07-12T09:00:00Z',
  },
  {
    id: 'folder-4',
    vaultId: 'vault-work',
    name: '数据库',
    itemCount: 2,
    createdAt: '2024-05-20T11:00:00Z',
    updatedAt: '2025-07-10T14:00:00Z',
  },
];

// 模拟保险库条目数据
const mockItems: VaultItem[] = [
  // === Personal 保险库条目 ===
  {
    id: 'item-1',
    vaultId: 'vault-personal',
    type: 'login',
    title: 'GitHub',
    favorite: true,
    isPinned: true,
    usageCount: 156,
    tags: ['开发', '代码'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2025-06-15T09:30:00Z',
    username: 'zhangsan_dev',
    password: 'Gh$ecure2024!xK9',
    url: 'https://github.com',
    totp: 'JBSWY3DPEHPK3PXP',
    notes: '个人开发账号，已开启双因素认证',
  },
  {
    id: 'item-2',
    vaultId: 'vault-personal',
    type: 'login',
    title: 'Gmail',
    favorite: false,
    isPinned: true,
    usageCount: 234,
    tags: ['邮箱', '常用'],
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2025-05-20T16:45:00Z',
    username: 'zhangsan@gmail.com',
    password: 'SimplePass123',
    url: 'https://mail.google.com',
    notes: '主邮箱账号',
    passwordHistory: [
      { password: 'OldGmailPass1', changedAt: '2024-02-05T11:00:00Z' },
      { password: 'SimplePass123', changedAt: '2025-05-20T16:45:00Z' },
    ],
  },
  {
    id: 'item-3',
    vaultId: 'vault-personal',
    type: 'credit_card',
    title: '招商银行信用卡',
    favorite: false,
    tags: ['银行卡', '支付'],
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
    cardholderName: '张三',
    cardNumber: '4392 **** **** 8867',
    expiryDate: '12/27',
    cvv: '***',
    cardType: 'visa',
    notes: '日常消费信用卡',
  },
  {
    id: 'item-4',
    vaultId: 'vault-personal',
    type: 'login',
    title: 'Netflix',
    favorite: true,
    tags: ['娱乐', '流媒体'],
    createdAt: '2024-04-01T08:30:00Z',
    updatedAt: '2025-03-10T12:00:00Z',
    username: 'zhangsan@gmail.com',
    password: 'Netflix2024!',
    url: 'https://netflix.com',
  },
  {
    id: 'item-5',
    vaultId: 'vault-personal',
    type: 'identity',
    title: '个人身份信息',
    favorite: false,
    tags: ['身份', '重要'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    fullName: '张三',
    firstName: '三',
    lastName: '张',
    email: 'zhangsan@gmail.com',
    phone: '+86 138-0000-1234',
    address: '北京市朝阳区建国路88号',
  },
  {
    id: 'item-6',
    vaultId: 'vault-personal',
    type: 'note',
    title: 'WiFi 密码',
    favorite: false,
    tags: ['网络', '常用'],
    createdAt: '2024-02-20T16:00:00Z',
    updatedAt: '2025-01-05T11:00:00Z',
    content: '家里WiFi：HomeNet_5G，密码：W1F1$ecure!2024\n办公室WiFi：OfficeNet，密码：0ff1ce@2024',
  },
  {
    id: 'item-7',
    vaultId: 'vault-personal',
    type: 'login',
    title: 'Steam',
    favorite: false,
    tags: ['游戏', '娱乐'],
    createdAt: '2024-05-12T20:00:00Z',
    updatedAt: '2025-06-01T18:30:00Z',
    username: 'zhangsan_gamer',
    password: 'St3amG4mer!',
    url: 'https://store.steampowered.com',
  },
  {
    id: 'item-8',
    vaultId: 'vault-personal',
    type: 'ssh_key',
    title: '个人服务器 SSH 密钥',
    favorite: false,
    tags: ['服务器', '开发'],
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
    publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... zhangsan@personal',
    privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----',
    keyType: 'ed25519',
    notes: '用于连接家里 NAS 和云服务器',
  },
  {
    id: 'item-9',
    vaultId: 'vault-personal',
    type: 'login',
    title: '淘宝',
    favorite: false,
    tags: ['购物', '常用'],
    createdAt: '2024-01-18T13:00:00Z',
    updatedAt: '2025-07-01T09:00:00Z',
    username: 'zhangsan_shop',
    password: 'Taobao123',
    url: 'https://taobao.com',
  },
  {
    id: 'item-10',
    vaultId: 'vault-personal',
    type: 'document',
    title: '护照扫描件',
    favorite: false,
    tags: ['证件', '重要'],
    createdAt: '2024-08-15T11:00:00Z',
    updatedAt: '2024-08-15T11:00:00Z',
    fileName: 'passport_scan.pdf',
    fileSize: 2048576,
    notes: '护照首页扫描件，有效期至2034年',
    attachments: [
      { id: 'att-1', name: 'passport_scan.pdf', size: 2048576, mimeType: 'application/pdf', content: '', createdAt: '2024-08-15T11:00:00Z' },
    ],
  },
  // === Work 保险库条目 ===
  {
    id: 'item-11',
    vaultId: 'vault-work',
    type: 'login',
    title: '公司邮箱',
    favorite: true,
    tags: ['工作', '邮箱'],
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2025-07-12T10:15:00Z',
    username: 'zhangsan@company.com',
    password: 'C0rpEmail!2024#Sec',
    url: 'https://mail.company.com',
    notes: '公司主邮箱，需定期更换密码',
  },
  {
    id: 'item-12',
    vaultId: 'vault-work',
    type: 'login',
    title: 'Jira',
    favorite: false,
    tags: ['工作', '项目管理'],
    createdAt: '2024-03-21T10:00:00Z',
    updatedAt: '2025-06-28T15:00:00Z',
    username: 'zhangsan',
    password: 'password123',
    url: 'https://jira.company.com',
    notes: '项目管理平台，使用 LDAP 登录',
  },
  {
    id: 'item-13',
    vaultId: 'vault-work',
    type: 'login',
    title: 'AWS 控制台',
    favorite: false,
    tags: ['工作', '云服务', '重要'],
    createdAt: '2024-04-05T14:00:00Z',
    updatedAt: '2025-07-11T08:00:00Z',
    username: 'zhangsan-admin@company.com',
    password: 'AWS$k8sPr0d!2024#Xz',
    url: 'https://console.aws.amazon.com',
    totp: 'HXDMVJECJJWSRB3H',
    notes: '生产环境管理权限，已开启 MFA',
  },
  {
    id: 'item-14',
    vaultId: 'vault-work',
    type: 'login',
    title: 'Slack',
    favorite: false,
    tags: ['工作', '沟通'],
    createdAt: '2024-03-25T11:00:00Z',
    updatedAt: '2025-05-10T09:30:00Z',
    username: 'zhangsan@company.com',
    password: 'SlackW0rk!2024',
    url: 'https://company.slack.com',
  },
  {
    id: 'item-15',
    vaultId: 'vault-work',
    type: 'note',
    title: '服务器部署笔记',
    favorite: false,
    tags: ['工作', '运维'],
    createdAt: '2024-06-15T16:00:00Z',
    updatedAt: '2025-06-20T14:00:00Z',
    content: '生产服务器部署流程：\n1. 拉取最新代码到 /opt/app\n2. 运行 npm run build\n3. 重启 PM2 服务\n4. 检查健康检查端点 /health\n\n数据库连接字符串在环境变量 DB_URI 中配置',
  },
  {
    id: 'item-16',
    vaultId: 'vault-work',
    type: 'ssh_key',
    title: '公司生产服务器密钥',
    favorite: false,
    tags: ['工作', '服务器', '重要'],
    createdAt: '2024-04-10T09:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
    publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... zhangsan@company',
    privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----',
    keyType: 'rsa',
    notes: '仅限生产环境跳板机使用，禁止在本机直接连接',
  },
  {
    id: 'item-17',
    vaultId: 'vault-work',
    type: 'login',
    title: 'Confluence',
    favorite: false,
    tags: ['工作', '文档'],
    createdAt: '2024-03-22T10:00:00Z',
    updatedAt: '2025-04-18T13:00:00Z',
    username: 'zhangsan',
    password: 'Confluence2024',
    url: 'https://wiki.company.com',
  },
  // === Passkey 通行密钥 ===
  {
    id: 'item-18',
    vaultId: 'vault-personal',
    type: 'passkey',
    title: 'Google Passkey',
    favorite: true,
    tags: ['Passkey', '常用'],
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2025-07-10T08:30:00Z',
    website: 'google.com',
    passkey: {
      credentialId: 'cred-google-abc123',
      publicKey: 'pQECAzYgASFYIIGq...',
      signCount: 42,
      rpId: 'google.com',
      deviceType: 'multi_device',
      backedUp: true,
      transports: ['internal', 'hybrid'],
      lastUsedAt: '2025-07-10T08:30:00Z',
    },
    notes: '使用 iPhone 15 Pro 创建的 Passkey，支持跨设备同步',
  },
  {
    id: 'item-19',
    vaultId: 'vault-personal',
    type: 'passkey',
    title: 'GitHub Passkey',
    favorite: false,
    tags: ['Passkey', '开发'],
    createdAt: '2024-10-15T14:00:00Z',
    updatedAt: '2025-06-20T16:45:00Z',
    website: 'github.com',
    passkey: {
      credentialId: 'cred-github-def456',
      publicKey: 'pQECAzYgASFYIIHr...',
      signCount: 15,
      rpId: 'github.com',
      deviceType: 'single_device',
      backedUp: false,
      transports: ['usb', 'nfc'],
      aaguid: 'aaguid-yubikey-5',
      lastUsedAt: '2025-06-20T16:45:00Z',
    },
    notes: 'YubiKey 5 硬件认证器，物理存储',
  },
  {
    id: 'item-20',
    vaultId: 'vault-work',
    type: 'passkey',
    title: 'Microsoft 365 Passkey',
    favorite: true,
    tags: ['Passkey', '工作'],
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2025-07-12T10:00:00Z',
    website: 'microsoft.com',
    passkey: {
      credentialId: 'cred-ms365-ghi789',
      publicKey: 'pQECAzYgASFYIIJs...',
      signCount: 78,
      rpId: 'login.microsoft.com',
      deviceType: 'multi_device',
      backedUp: true,
      transports: ['internal'],
      lastUsedAt: '2025-07-12T10:00:00Z',
    },
    notes: '公司 Microsoft 365 账户 Passkey',
  },
  // === TOTP 验证器 ===
  {
    id: 'item-21',
    vaultId: 'vault-personal',
    type: 'totp_authenticator',
    title: 'Dropbox',
    favorite: false,
    tags: ['TOTP', '云存储'],
    createdAt: '2024-08-20T12:00:00Z',
    updatedAt: '2025-03-15T09:00:00Z',
    totpConfig: {
      secret: 'JBSWY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      issuer: 'Dropbox',
      account: 'zhangsan@gmail.com',
    },
    notes: 'Dropbox 两步验证',
  },
  {
    id: 'item-22',
    vaultId: 'vault-personal',
    type: 'totp_authenticator',
    title: 'Amazon',
    favorite: false,
    tags: ['TOTP', '购物'],
    createdAt: '2024-09-10T16:00:00Z',
    updatedAt: '2025-04-20T11:00:00Z',
    totpConfig: {
      secret: 'HXDMVJECJWSRB3HW',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      issuer: 'Amazon',
      account: 'zhangsan_prime',
    },
    notes: 'Amazon 账户两步验证',
  },
  {
    id: 'item-23',
    vaultId: 'vault-personal',
    type: 'totp_authenticator',
    title: 'Twitter/X',
    favorite: false,
    tags: ['TOTP', '社交'],
    createdAt: '2024-10-05T20:00:00Z',
    updatedAt: '2025-05-10T14:30:00Z',
    totpConfig: {
      secret: 'KQVXQY3DPEHPK3PXP',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      issuer: 'Twitter',
      account: '@zhangsan',
    },
    notes: 'Twitter 账户两步验证',
  },
  {
    id: 'item-24',
    vaultId: 'vault-work',
    type: 'totp_authenticator',
    title: 'AWS Console',
    favorite: true,
    tags: ['TOTP', '工作', '云服务'],
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2025-07-11T09:00:00Z',
    totpConfig: {
      secret: 'AWSSECURERANDOMSECRETKEY',
      algorithm: 'SHA256',
      digits: 6,
      period: 30,
      issuer: 'AWS',
      account: 'zhangsan@company.com',
    },
    notes: 'AWS IAM 用户两步验证（SHA256 算法）',
  },
  {
    id: 'item-25',
    vaultId: 'vault-work',
    type: 'totp_authenticator',
    title: 'Slack',
    favorite: false,
    tags: ['TOTP', '工作', '沟通'],
    createdAt: '2024-08-01T11:00:00Z',
    updatedAt: '2025-06-15T13:00:00Z',
    totpConfig: {
      secret: 'SLACKTEAMSECRET12345',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      issuer: 'Slack',
      account: 'zhangsan@company.com',
    },
    notes: 'Slack 团队两步验证',
  },
];

// 模拟安全瞭望塔数据
const mockWatchtowerSummary: WatchtowerSummary = {
  score: 72,
  weakPasswords: 2,
  reusedPasswords: 1,
  compromisedPasswords: 0,
  expiredItems: 1,
  missing2FA: 3,
};

const mockAlerts: SecurityAlert[] = [
  {
    id: 'alert-1',
    type: 'weak',
    severity: 'high',
    itemId: 'item-12',
    itemTitle: 'Jira',
    description: '该密码强度过低，建议使用至少12位包含大小写字母、数字和特殊字符的密码',
  },
  {
    id: 'alert-2',
    type: 'weak',
    severity: 'high',
    itemId: 'item-9',
    itemTitle: '淘宝',
    description: '该密码强度过低，容易被暴力破解，请立即更换',
  },
  {
    id: 'alert-3',
    type: 'reused',
    severity: 'medium',
    itemId: 'item-2',
    itemTitle: 'Gmail',
    description: '该密码在其他项目中重复使用，建议为每个账户设置独立密码',
  },
  {
    id: 'alert-4',
    type: 'expired',
    severity: 'low',
    itemId: 'item-10',
    itemTitle: '护照扫描件',
    description: '该文档已超过1年未更新，请确认信息是否仍然有效',
  },
  {
    id: 'alert-5',
    type: 'missing_2fa',
    severity: 'medium',
    itemId: 'item-5',
    itemTitle: '个人身份信息',
    description: '该账户未开启两步验证，建议开启以提高安全性',
  },
  {
    id: 'alert-6',
    type: 'missing_2fa',
    severity: 'high',
    itemId: 'item-7',
    itemTitle: 'Steam',
    description: '该账户涉及资金安全，强烈建议开启两步验证',
  },
];

// 模拟设备数据
const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: 'MacBook Pro - Chrome',
    type: 'mac',
    lastActiveAt: '2025-07-13T09:00:00Z',
    isCurrent: true,
  },
  {
    id: 'device-2',
    name: 'iPhone 15 Pro',
    type: 'iphone',
    lastActiveAt: '2025-07-12T20:30:00Z',
    isCurrent: false,
  },
  {
    id: 'device-3',
    name: 'Firefox 浏览器扩展',
    type: 'extension',
    lastActiveAt: '2025-07-10T15:00:00Z',
    isCurrent: false,
  },
];

// 模拟订阅数据
const mockSubscription: Subscription = {
  plan: 'premium',
  startAt: '2024-01-15T08:00:00Z',
  expiresAt: '2027-08-15T08:00:00Z',
  source: 'direct',
};

// 模拟用户资料数据
const mockProfile: UserProfile = {
  email: 'zhangsan@gmail.com',
  createdAt: '2024-01-15T08:00:00Z',
  plan: 'premium',
  avatarUrl: undefined,
  subscription: mockSubscription,
};

// 模拟设置数据
const mockSettings: VaultSettings = {
  autoLockMinutes: 15,
  failedAttemptsBeforeLock: 5,
  clipboardClearSeconds: 30,
  travelModeEnabled: false,
  hiddenVaultIds: [],
  allowedDomains: ['*.google.com', '*.github.com', '*.microsoft.com'],
  blockedDomains: ['*.malware.com', '*.phishing-site.com'],
  matchMode: 'fuzzy',
};

// 模拟恢复密钥数据
const mockRecoveryKeys: RecoveryKey[] = [
  {
    id: 'recovery-1',
    key: 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY-ZABCD-EFGHI-JKLMN',
    createdAt: '2024-01-15T08:00:00Z',
    used: false,
  },
];

// 模拟紧急访问数据
const mockEmergencyAccess: EmergencyAccess[] = [
  {
    id: 'emergency-1',
    trustedEmail: 'lisi@example.com',
    accessLevel: 'view',
    approvalRequired: true,
    waitingPeriodHours: 24,
    createdAt: '2024-06-01T10:00:00Z',
  },
];

// 模拟管理员设置数据
const mockAdminSettings: AdminSettings = {
  siteInfo: {
    name: 'VaultKey 密码管理器',
    logoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20security%20vault%20icon%20with%20shield%20and%20key%20blue%20gradient%20minimal%20design&image_size=square',
    description: '企业级密码管理解决方案，端到端加密，多平台支持',
  },
  notificationConfig: {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    senderEmail: 'noreply@vaultkey.com',
    senderName: 'VaultKey 系统通知',
    enabled: false,
  },
  redeemCodes: [
    {
      id: 'redeem-1',
      code: 'PREMIUM2024',
      planType: 'premium',
      totalUses: 10,
      usedCount: 3,
      expiresAt: '2027-12-31T23:59:59Z',
      enabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      subscriptionDays: 365,
    },
    {
      id: 'redeem-2',
      code: 'FAMILY2024',
      planType: 'family',
      totalUses: 5,
      usedCount: 5,
      expiresAt: '2027-06-01T00:00:00Z',
      enabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      subscriptionDays: 365,
    },
  ],
};

// 模拟通知数据
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'subscription',
    title: '订阅即将到期',
    message: '您的 Premium 订阅将在 7 天后到期，请及时续费。',
    read: false,
    createdAt: '2025-07-08T10:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'security',
    title: '新设备登录提醒',
    message: '检测到您的账户在新设备上登录，如非本人操作请立即修改密码。',
    read: true,
    createdAt: '2025-07-05T14:30:00Z',
  },
  {
    id: 'notif-3',
    type: 'system',
    title: '系统维护通知',
    message: 'VaultKey 将于本周日凌晨 2:00-4:00 进行系统维护，期间服务可能不可用。',
    read: false,
    createdAt: '2025-07-10T09:00:00Z',
  },
];

// ==================== 密码生成工具函数 ====================

/** 生成随机密码 */
function generateRandomPassword(
  length: number,
  uppercase: boolean,
  lowercase: boolean,
  digits: boolean,
  symbols: boolean,
  readable: boolean,
  excludeAmbiguous: boolean,
  noConsecutive: boolean,
  noRepeat: boolean,
): string {
  let chars = '';
  if (uppercase) chars += excludeAmbiguous || readable ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) chars += excludeAmbiguous || readable ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  if (digits) chars += excludeAmbiguous || readable ? '23456789' : '0123456789';
  if (symbols) chars += readable ? '!@#$%&*' : '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghjkmnpqrstuvwxyz';

  let password = '';
  const array = new Uint32Array(length);
  getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    let charIndex = array[i] % chars.length;
    let char = chars[charIndex];
    
    if (noRepeat && i > 0) {
      while (char === password[i - 1]) {
        charIndex = (charIndex + 1) % chars.length;
        char = chars[charIndex];
      }
    }
    
    if (noConsecutive && i > 0) {
      const prevCharCode = password.charCodeAt(i - 1);
      while (Math.abs(char.charCodeAt(0) - prevCharCode) === 1) {
        charIndex = (charIndex + 1) % chars.length;
        char = chars[charIndex];
      }
    }
    
    password += char;
  }
  return password;
}

/** 生成随机密码短语 */
function generatePassphrase(): string {
  const words = [
    '星空', '大海', '山川', '流水', '白云', '清风', '明月', '晨光',
    '松柏', '竹林', '花园', '溪谷', '彩虹', '雪花', '春雨', '秋叶',
    '骏马', '飞鹰', '锦鲤', '白鹤', '青鸾', '灵鹿', '雪豹', '云雀',
  ];
  const array = new Uint32Array(4);
  getRandomValues(array);
  return Array.from(array, (v) => words[v % words.length]).join('-');
}

/** 计算密码强度 */
function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedbacks: string[] = [];
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  
  if (/([a-zA-Z])\1\1\1/.test(password)) {
    score -= 2;
    feedbacks.push('避免连续重复字符');
  } else if (/([a-zA-Z])\1\1/.test(password)) {
    score -= 1;
  }
  
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score -= 2;
    feedbacks.push('避免连续字母序列');
  }
  
  if (/123|234|345|456|567|678|789|012/.test(password)) {
    score -= 2;
    feedbacks.push('避免连续数字序列');
  }
  
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123', 'monkey', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score -= 3;
    feedbacks.push('避免使用常见密码模式');
  }
  
  if (password.length < 8) {
    feedbacks.push('密码长度至少8位');
  }
  
  if (!/[a-z]/.test(password)) {
    feedbacks.push('添加小写字母');
  }
  if (!/[A-Z]/.test(password)) {
    feedbacks.push('添加大写字母');
  }
  if (!/[0-9]/.test(password)) {
    feedbacks.push('添加数字');
  }
  if (!/[^a-zA-Z0-9]/.test(password) && password.length >= 12) {
    feedbacks.push('添加特殊符号');
  }
  
  score = Math.max(0, Math.min(10, score));
  
  let label: PasswordStrength['label'];
  let feedback: string;
  
  if (score <= 2) {
    label = 'weak';
    feedback = feedbacks.length > 0 ? feedbacks.join('；') : '密码太弱，建议增加长度和复杂度';
  } else if (score <= 4) {
    label = 'fair';
    feedback = feedbacks.length > 0 ? feedbacks.join('；') : '密码一般，建议添加更多字符类型';
  } else if (score <= 6) {
    label = 'good';
    feedback = feedbacks.length > 0 ? feedbacks.join('；') : '密码不错，但可以更强';
  } else if (score <= 8) {
    label = 'strong';
    feedback = feedbacks.length > 0 ? feedbacks.join('；') : '密码强度优秀';
  } else {
    label = 'strong';
    feedback = '密码强度非常高';
  }
  
  return { score, label, feedback };
}

// ==================== Zustand Store ====================

const useStore = create<StoreState>()((set, get) => ({
  // ---------- 认证切片 ----------
  auth: {
    isAuthenticated: false,
    isLocked: true,
    email: '',
    saltA: '',
    saltB: '',
    k1Hash: '',
    secureKeyBase32: '',
    vaultKey: null,
    failedAttempts: 0,
    lastActivityTime: Date.now(),
    trustedDeviceId: null,

    initLocalKeyStorage: async () => {
      try {
        const storedKeyData = localStorage.getItem('vaultkey-local-keys');
        if (storedKeyData) {
          const keyData = JSON.parse(storedKeyData);
          set((state) => ({
            auth: {
              ...state.auth,
              saltA: keyData.saltA || '',
              saltB: keyData.saltB || '',
              k1Hash: keyData.k1Hash || '',
              secureKeyBase32: keyData.secureKeyBase32 || '',
              email: keyData.email || '',
            },
          }));
        }
      } catch (error) {
        console.warn('Failed to init local key storage:', error);
      }
    },

    login: async (email: string, password: string, rememberDevice = false) => {
      const now = Date.now();
      let deviceId: string | null = null;

      const storedKeyData = localStorage.getItem('vaultkey-local-keys');
      if (!storedKeyData) {
        throw new Error('No local key data found');
      }

      const keyData = JSON.parse(storedKeyData);
      const saltA = base64ToBytes(keyData.saltA);
      const saltB = base64ToBytes(keyData.saltB);
      const secureKey = parseSecureKey(keyData.secureKeyBase32);

      const k1 = await deriveK1(password, saltA);
      const computedK1Hash = await hashSHA256(bytesToHex(k1));

      if (computedK1Hash !== keyData.k1Hash) {
        throw new Error('Invalid password');
      }

      const vaultKey = await deriveVaultKey(k1, secureKey.raw, saltB);

      if (rememberDevice) {
        deviceId = generateDeviceId();
        const trustedDeviceData = {
          deviceId,
          email,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('vaultkey-trusted-device', JSON.stringify(trustedDeviceData));
        } catch (error) {
          console.warn('localStorage operation failed:', error);
          deviceId = null;
        }
      }

      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: true,
          isLocked: false,
          email,
          saltA: keyData.saltA,
          saltB: keyData.saltB,
          k1Hash: keyData.k1Hash,
          secureKeyBase32: keyData.secureKeyBase32,
          vaultKey,
          failedAttempts: 0,
          lastActivityTime: now,
          trustedDeviceId: deviceId,
        },
      }));
    },

    register: async (email: string, password: string, rememberDevice = false) => {
      const existingEmail = get().profile.profile.email;
      if (email === existingEmail) {
        return { success: false };
      }

      const secureKey = generateSecureKey();
      const saltA = await generateSaltA(email);
      const saltB = await generateSaltB();
      const k1 = await deriveK1(password, saltA);
      const k1Hash = await hashSHA256(bytesToHex(k1));
      const vaultKey = await deriveVaultKey(k1, secureKey.raw, saltB);

      const now = Date.now();
      let deviceId: string | null = null;

      if (rememberDevice) {
        deviceId = generateDeviceId();
        const trustedDeviceData = {
          deviceId,
          email,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('vaultkey-trusted-device', JSON.stringify(trustedDeviceData));
        } catch (error) {
          console.warn('localStorage operation failed:', error);
          deviceId = null;
        }
      }

      const localKeyData = {
        saltA: bytesToBase64(saltA),
        saltB: bytesToBase64(saltB),
        k1Hash,
        secureKeyBase32: secureKey.base32,
        email,
      };

      try {
        localStorage.setItem('vaultkey-local-keys', JSON.stringify(localKeyData));
      } catch (error) {
        console.warn('localStorage operation failed:', error);
      }

      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: true,
          isLocked: false,
          email,
          saltA: localKeyData.saltA,
          saltB: localKeyData.saltB,
          k1Hash,
          secureKeyBase32: secureKey.base32,
          vaultKey,
          failedAttempts: 0,
          lastActivityTime: now,
          trustedDeviceId: deviceId,
        },
      }));

      return { success: true, secureKey: secureKey.base32 };
    },

    logout: () => {
      try {
        localStorage.removeItem('vaultkey-trusted-device');
      } catch (error) {
        console.warn('localStorage operation failed:', error);
      }
      set((state) => ({
        auth: {
          ...state.auth,
          isAuthenticated: false,
          isLocked: true,
          email: '',
          saltA: '',
          saltB: '',
          k1Hash: '',
          secureKeyBase32: '',
          vaultKey: null,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          trustedDeviceId: null,
        },
      }));
    },

    lock: () => {
      set((state) => ({
        auth: { ...state.auth, isLocked: true, vaultKey: null },
      }));
    },

    setTrustedDevice: (deviceId: string) => {
      set((state) => ({
        auth: { ...state.auth, trustedDeviceId: deviceId },
      }));
    },

    clearTrustedDevice: () => {
      try {
        localStorage.removeItem('vaultkey-trusted-device');
      } catch (error) {
        console.warn('localStorage operation failed:', error);
      }
      set((state) => ({
        auth: { ...state.auth, trustedDeviceId: null },
      }));
    },

    checkTrustedDevice: () => {
      try {
        const storedDevice = localStorage.getItem('vaultkey-trusted-device');
        if (storedDevice) {
          const deviceData = JSON.parse(storedDevice) as { deviceId: string; email: string };
          const { auth } = get();
          if (auth.email && deviceData.email === auth.email) {
            set((state) => ({
              auth: { ...state.auth, trustedDeviceId: deviceData.deviceId },
            }));
            return true;
          }
        }
      } catch (error) {
        console.warn('JSON.parse failed:', error);
      }
      return false;
    },

    unlockWithTrustedDevice: async () => {
      try {
        const storedDevice = localStorage.getItem('vaultkey-trusted-device');
        if (storedDevice) {
          const deviceData = JSON.parse(storedDevice) as { deviceId: string; email: string };
          const { auth } = get();
          if (auth.email && deviceData.email === auth.email) {
            const storedKeyData = localStorage.getItem('vaultkey-local-keys');
            if (!storedKeyData) {
              return false;
            }

            const keyData = JSON.parse(storedKeyData);
            const secureKey = parseSecureKey(keyData.secureKeyBase32);

            const encryptedVaultKey = localStorage.getItem('vaultkey-encrypted-vault-key');
            if (!encryptedVaultKey) {
              return false;
            }

            const encryptedData = JSON.parse(encryptedVaultKey);
            try {
              const decrypted = await decryptAESGCM(encryptedData, secureKey.raw);
              const vaultKey = JSON.parse(decrypted);

              set((state) => ({
                auth: {
                  ...state.auth,
                  isLocked: false,
                  failedAttempts: 0,
                  lastActivityTime: Date.now(),
                  trustedDeviceId: deviceData.deviceId,
                  vaultKey: {
                    rootKey: base64ToBytes(vaultKey.rootKey),
                    srpKey: base64ToBytes(vaultKey.srpKey),
                  },
                },
              }));
              return true;
            } catch {
              return false;
            }
          }
        }
      } catch (error) {
        console.warn('localStorage/JSON.parse failed:', error);
      }
      return false;
    },

    unlock: async (password: string) => {
      const { auth } = get();
      
      if (!auth.saltA || !auth.saltB || !auth.k1Hash || !auth.secureKeyBase32) {
        return false;
      }

      const saltA = base64ToBytes(auth.saltA);
      const saltB = base64ToBytes(auth.saltB);
      const secureKey = parseSecureKey(auth.secureKeyBase32);

      const k1 = await deriveK1(password, saltA);
      const computedK1Hash = await hashSHA256(bytesToHex(k1));

      if (computedK1Hash !== auth.k1Hash) {
        set((state) => ({
          auth: {
            ...state.auth,
            failedAttempts: state.auth.failedAttempts + 1,
            isLocked: state.auth.failedAttempts + 1 >= get().settings.settings.failedAttemptsBeforeLock,
          },
        }));
        return false;
      }

      const vaultKey = await deriveVaultKey(k1, secureKey.raw, saltB);

      set((state) => ({
        auth: {
          ...state.auth,
          isLocked: false,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          vaultKey,
        },
      }));
      return true;
    },

    unlockWithRecoveryKey: async (recoveryKey: string) => {
      const { auth } = get();
      
      const storedRecoveryKey = localStorage.getItem('vaultkey-recovery-key');
      if (!storedRecoveryKey) {
        return false;
      }

      if (recoveryKey.trim().toUpperCase() !== storedRecoveryKey) {
        return false;
      }

      if (!auth.saltA || !auth.saltB || !auth.secureKeyBase32) {
        return false;
      }

      const saltB = base64ToBytes(auth.saltB);
      const secureKey = parseSecureKey(auth.secureKeyBase32);

      const recoveryK1 = await deriveK1(recoveryKey, base64ToBytes(auth.saltA));
      const vaultKey = await deriveVaultKey(recoveryK1, secureKey.raw, saltB);

      set((state) => ({
        auth: {
          ...state.auth,
          isLocked: false,
          failedAttempts: 0,
          lastActivityTime: Date.now(),
          vaultKey,
        },
      }));
      return true;
    },

    resetActivityTimer: () => {
      set((state) => ({
        auth: { ...state.auth, lastActivityTime: Date.now() },
      }));
    },

    checkAutoLock: () => {
      const { auth, settings } = get();
      if (!auth.isAuthenticated || auth.isLocked) return;
      
      const autoLockMinutes = settings.settings.autoLockMinutes;
      if (autoLockMinutes <= 0) return;
      
      const now = Date.now();
      const elapsedMinutes = (now - auth.lastActivityTime) / 60000;
      
      if (elapsedMinutes >= autoLockMinutes) {
        set((state) => ({
          auth: { ...state.auth, isLocked: true, vaultKey: null },
        }));
      }
    },
  },

  // ---------- 保险库切片 ----------
  vaults: {
    list: mockVaults,
    currentVaultId: 'vault-personal',

    addVault: (vault) => {
      const now = new Date().toISOString();
      const newVault: Vault = {
        ...vault,
        id: `vault-${Date.now()}`,
        itemCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        vaults: { ...state.vaults, list: [...state.vaults.list, newVault] },
      }));
    },

    deleteVault: (vaultId) => {
      set((state) => ({
        vaults: {
          ...state.vaults,
          list: state.vaults.list.filter((v) => v.id !== vaultId),
          currentVaultId:
            state.vaults.currentVaultId === vaultId
              ? state.vaults.list.find((v) => v.id !== vaultId)?.id ?? ''
              : state.vaults.currentVaultId,
        },
        items: { ...state.items, list: state.items.list.filter((i) => i.vaultId !== vaultId) },
      }));
    },

    updateVault: (vaultId, updates) => {
      set((state) => ({
        vaults: {
          ...state.vaults,
          list: state.vaults.list.map((v) =>
            v.id === vaultId ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
          ),
        },
      }));
    },

    setCurrentVault: (vaultId) => {
      set((state) => ({
        vaults: { ...state.vaults, currentVaultId: vaultId },
      }));
    },

    addVaultMember: (vaultId, email, role) => {
      const now = new Date().toISOString();
      const newMember: VaultMember = {
        id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        email,
        role,
        createdAt: now,
      };
      set((state) => ({
        vaults: {
          ...state.vaults,
          list: state.vaults.list.map((v) =>
            v.id === vaultId
              ? { ...v, members: [...(v.members || []), newMember], updatedAt: now }
              : v
          ),
        },
      }));
    },

    removeVaultMember: (vaultId, memberId) => {
      set((state) => ({
        vaults: {
          ...state.vaults,
          list: state.vaults.list.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  members: (v.members || []).filter((m) => m.id !== memberId),
                  updatedAt: new Date().toISOString(),
                }
              : v
          ),
        },
      }));
    },

    updateVaultMemberRole: (vaultId, memberId, role) => {
      set((state) => ({
        vaults: {
          ...state.vaults,
          list: state.vaults.list.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  members: (v.members || []).map((m) =>
                    m.id === memberId ? { ...m, role } : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : v
          ),
        },
      }));
    },
  },

  // ---------- 文件夹切片 ----------
  folders: {
    list: mockFolders,
    currentFolderId: null,

    addFolder: (folder) => {
      const now = new Date().toISOString();
      const newFolder: Folder = {
        ...folder,
        id: `folder-${Date.now()}`,
        itemCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        folders: { ...state.folders, list: [...state.folders.list, newFolder] },
      }));
    },

    deleteFolder: (folderId) => {
      set((state) => ({
        folders: {
          ...state.folders,
          list: state.folders.list.filter((f) => f.id !== folderId),
          currentFolderId: state.folders.currentFolderId === folderId ? null : state.folders.currentFolderId,
        },
        items: { ...state.items, list: state.items.list.map((i) => 
          i.folderId === folderId ? { ...i, folderId: undefined } : i
        )},
      }));
    },

    updateFolder: (folderId, updates) => {
      const now = new Date().toISOString();
      set((state) => ({
        folders: {
          ...state.folders,
          list: state.folders.list.map((f) =>
            f.id === folderId ? { ...f, ...updates, updatedAt: now } : f,
          ),
        },
      }));
    },

    setCurrentFolder: (folderId) => {
      set((state) => ({
        folders: { ...state.folders, currentFolderId: folderId },
      }));
    },
  },

  // ---------- 条目切片 ----------
  items: {
    list: mockItems,
    searchQuery: '',
    itemTypeFilter: null,
    tagFilter: null,
    selectedItemIds: [],
    showTrashed: false,

    addItem: (item) => {
      const now = new Date().toISOString();
      const newItem: VaultItem = {
        ...item,
        id: `item-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        isPinned: item.isPinned ?? false,
        usageCount: item.usageCount ?? 0,
      };
      set((state) => {
        const updatedVaultList = state.vaults.list.map((v) =>
          v.id === item.vaultId ? { ...v, itemCount: v.itemCount + 1, updatedAt: now } : v,
        );
        return {
          items: { ...state.items, list: [...state.items.list, newItem] },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    updateItem: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        const existingItem = state.items.list.find((i) => i.id === id);
        let passwordHistory = existingItem?.passwordHistory || [];

        // 如果密码发生变化，记录密码历史
        if (
          updates.password !== undefined &&
          existingItem?.password &&
          updates.password !== existingItem.password
        ) {
          passwordHistory = [
            { password: existingItem.password, changedAt: now },
            ...passwordHistory,
          ].slice(0, 10); // 最多保留 10 条历史记录
        }

        return {
          items: {
            ...state.items,
            list: state.items.list.map((item) =>
              item.id === id
                ? { ...item, ...updates, passwordHistory, updatedAt: now }
                : item,
            ),
          },
        };
      });
    },

    deleteItem: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        const item = state.items.list.find((i) => i.id === id);
        const updatedVaultList = item && !item.trashedAt
          ? state.vaults.list.map((v) =>
              v.id === item.vaultId ? { ...v, itemCount: Math.max(0, v.itemCount - 1) } : v,
            )
          : state.vaults.list;
        return {
          items: {
            ...state.items,
            list: state.items.list.map((i) =>
              i.id === id ? { ...i, trashedAt: now, updatedAt: now } : i,
            ),
          },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    restoreItem: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        const item = state.items.list.find((i) => i.id === id);
        const updatedVaultList = item && item.trashedAt
          ? state.vaults.list.map((v) =>
              v.id === item.vaultId ? { ...v, itemCount: v.itemCount + 1 } : v,
            )
          : state.vaults.list;
        return {
          items: {
            ...state.items,
            list: state.items.list.map((i) =>
              i.id === id ? { ...i, trashedAt: undefined, updatedAt: now } : i,
            ),
          },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    permanentDeleteItem: (id) => {
      set((state) => {
        const item = state.items.list.find((i) => i.id === id);
        const updatedVaultList = item && !item.trashedAt
          ? state.vaults.list.map((v) =>
              v.id === item.vaultId ? { ...v, itemCount: Math.max(0, v.itemCount - 1) } : v,
            )
          : state.vaults.list;
        return {
          items: { ...state.items, list: state.items.list.filter((i) => i.id !== id) },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    emptyTrash: () => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.filter((i) => !i.trashedAt),
        },
      }));
    },

    toggleFavorite: (id) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === id
              ? { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString() }
              : item,
          ),
        },
      }));
    },

    togglePin: (id) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === id
              ? { ...item, isPinned: !item.isPinned, updatedAt: new Date().toISOString() }
              : item,
          ),
        },
      }));
    },

    toggleSelect: (id) => {
      set((state) => ({
        items: {
          ...state.items,
          selectedItemIds: state.items.selectedItemIds.includes(id)
            ? state.items.selectedItemIds.filter((i) => i !== id)
            : [...state.items.selectedItemIds, id],
        },
      }));
    },

    selectAll: () => {
      const { list, showTrashed } = get().items;
      const currentVaultId = get().vaults.currentVaultId;
      const currentVaultItems = list.filter(
        (i) => i.vaultId === currentVaultId && (showTrashed ? !!i.trashedAt : !i.trashedAt),
      );
      set((state) => ({
        items: { ...state.items, selectedItemIds: currentVaultItems.map((i) => i.id) },
      }));
    },

    clearSelection: () => {
      set((state) => ({ items: { ...state.items, selectedItemIds: [] } }));
    },

    deleteSelected: () => {
      const { selectedItemIds } = get().items;
      if (selectedItemIds.length === 0) return;
      const now = new Date().toISOString();

      set((state) => {
        const itemsToDelete = state.items.list.filter(
          (i) => selectedItemIds.includes(i.id) && !i.trashedAt,
        );
        const vaultIds = new Set(itemsToDelete.map((i) => i.vaultId));
        const updatedVaultList = state.vaults.list.map((v) =>
          vaultIds.has(v.id)
            ? { ...v, itemCount: Math.max(0, v.itemCount - itemsToDelete.filter((i) => i.vaultId === v.id).length) }
            : v,
        );
        return {
          items: {
            ...state.items,
            list: state.items.list.map((i) =>
              selectedItemIds.includes(i.id)
                ? { ...i, trashedAt: now, updatedAt: now }
                : i,
            ),
            selectedItemIds: [],
          },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    restoreSelected: () => {
      const { selectedItemIds } = get().items;
      if (selectedItemIds.length === 0) return;
      const now = new Date().toISOString();

      set((state) => {
        const itemsToRestore = state.items.list.filter(
          (i) => selectedItemIds.includes(i.id) && i.trashedAt,
        );
        const vaultIds = new Set(itemsToRestore.map((i) => i.vaultId));
        const updatedVaultList = state.vaults.list.map((v) =>
          vaultIds.has(v.id)
            ? { ...v, itemCount: v.itemCount + itemsToRestore.filter((i) => i.vaultId === v.id).length }
            : v,
        );
        return {
          items: {
            ...state.items,
            list: state.items.list.map((i) =>
              selectedItemIds.includes(i.id)
                ? { ...i, trashedAt: undefined, updatedAt: now }
                : i,
            ),
            selectedItemIds: [],
          },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    permanentDeleteSelected: () => {
      const { selectedItemIds } = get().items;
      if (selectedItemIds.length === 0) return;

      set((state) => {
        const itemsToDelete = state.items.list.filter((i) => selectedItemIds.includes(i.id));
        const nonTrashedItems = itemsToDelete.filter((i) => !i.trashedAt);
        const vaultIds = new Set(nonTrashedItems.map((i) => i.vaultId));
        const updatedVaultList = state.vaults.list.map((v) =>
          vaultIds.has(v.id)
            ? { ...v, itemCount: Math.max(0, v.itemCount - nonTrashedItems.filter((i) => i.vaultId === v.id).length) }
            : v,
        );
        return {
          items: {
            ...state.items,
            list: state.items.list.filter((i) => !selectedItemIds.includes(i.id)),
            selectedItemIds: [],
          },
          vaults: { ...state.vaults, list: updatedVaultList },
        };
      });
    },

    moveSelected: (folderId) => {
      const { selectedItemIds } = get().items;
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((i) =>
            selectedItemIds.includes(i.id)
              ? { ...i, folderId, updatedAt: new Date().toISOString() }
              : i,
          ),
          selectedItemIds: [],
        },
      }));
    },

    exportSelected: () => {
      const { selectedItemIds, list } = get().items;
      const selectedItems = list.filter((i) => selectedItemIds.includes(i.id));
      return JSON.stringify(selectedItems, null, 2);
    },

    incrementUsage: (id) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((i) =>
            i.id === id
              ? { ...i, usageCount: (i.usageCount || 0) + 1, lastUsedAt: new Date().toISOString() }
              : i,
          ),
        },
      }));
    },

    setSearchQuery: (query) => {
      set((state) => ({
        items: { ...state.items, searchQuery: query },
      }));
    },

    setItemTypeFilter: (type) => {
      set((state) => ({
        items: { ...state.items, itemTypeFilter: type },
      }));
    },

    setTagFilter: (tag) => {
      set((state) => ({
        items: { ...state.items, tagFilter: tag },
      }));
    },

    setShowTrashed: (show) => {
      set((state) => ({
        items: { ...state.items, showTrashed: show },
      }));
    },

    addAttachment: (itemId, attachment) => {
      const now = new Date().toISOString();
      const newAttachment: Attachment = {
        ...attachment,
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
      };
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === itemId
              ? { ...item, attachments: [...(item.attachments || []), newAttachment], updatedAt: now }
              : item,
          ),
        },
      }));
    },

    removeAttachment: (itemId, attachmentId) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  attachments: (item.attachments || []).filter((att) => att.id !== attachmentId),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        },
      }));
    },

    rollbackPassword: (itemId, password) => {
      const now = new Date().toISOString();
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) => {
            if (item.id !== itemId) return item;
            const currentPassword = item.password;
            const oldHistory = item.passwordHistory || [];
            const filteredHistory = oldHistory.filter((entry) => entry.password !== password);
            const newHistory = currentPassword
              ? [{ password: currentPassword, changedAt: now }, ...filteredHistory].slice(0, 10)
              : filteredHistory;
            return {
              ...item,
              password,
              passwordHistory: newHistory,
              updatedAt: now,
            };
          }),
        },
      }));
    },

    shareItem: (itemId, email, permission) => {
      const now = new Date().toISOString();
      const newShareRecord: ShareRecord = {
        id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        email,
        permission,
        createdAt: now,
      };
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  sharedWith: [...(item.sharedWith || []), newShareRecord],
                  updatedAt: now,
                }
              : item,
          ),
        },
      }));
    },

    unshareItem: (itemId, shareId) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  sharedWith: (item.sharedWith || []).filter((share) => share.id !== shareId),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        },
      }));
    },

    updateSharePermission: (itemId, shareId, permission) => {
      set((state) => ({
        items: {
          ...state.items,
          list: state.items.list.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  sharedWith: (item.sharedWith || []).map((share) =>
                    share.id === shareId ? { ...share, permission } : share,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        },
      }));
    },
  },

  // ---------- 安全瞭望塔切片 ----------
  watchtower: {
    summary: mockWatchtowerSummary,
    alerts: mockAlerts,
    breaches: [] as BreachResult[],
    isCheckingBreach: false,
    lastBreachCheck: null as string | null,

    checkBreach: async (email: string) => {
      set((state) => ({
        watchtower: { ...state.watchtower, isCheckingBreach: true },
      }));
      const breaches = await checkEmailBreaches(email);
      set((state) => ({
        watchtower: {
          ...state.watchtower,
          breaches,
          isCheckingBreach: false,
          lastBreachCheck: new Date().toISOString(),
        },
      }));
      return breaches;
    },

    checkPasswordLeak: async (password: string) => {
      return checkPasswordLeak(password);
    },

    runFullAudit: () => {
      const items = get().items.list;
      const alerts: SecurityAlert[] = [];
      const weakPasswords: string[] = [];
      const reusedPasswordMap = new Map<string, string[]>();
      const missing2FA: string[] = [];

      const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'monkey', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou'];
      const leakedDomains = ['adobe.com', 'linkedin.com', 'dropbox.com', 'evernote.com', 'ashleyMadison.com'];

      items.forEach((item) => {
        if (item.type === 'login' && item.password) {
          const password = item.password;
          
          if (password.length < 8 || commonPasswords.includes(password.toLowerCase())) {
            weakPasswords.push(item.id);
            alerts.push({
              id: `alert-${Date.now()}-${item.id}-weak`,
              type: 'weak',
              severity: 'high',
              itemId: item.id,
              itemTitle: item.title,
              description: '密码过于简单，容易被破解',
            });
          } else {
            const strength = calculatePasswordStrength(password);
            if (strength.label === 'weak') {
              weakPasswords.push(item.id);
              alerts.push({
                id: `alert-${Date.now()}-${item.id}-weak`,
                type: 'weak',
                severity: 'medium',
                itemId: item.id,
                itemTitle: item.title,
                description: strength.feedback,
              });
            }
          }

          const hash = password.toLowerCase();
          if (!reusedPasswordMap.has(hash)) {
            reusedPasswordMap.set(hash, []);
          }
          reusedPasswordMap.get(hash)!.push(item.id);

          if (!item.totp && !item.passkey) {
            missing2FA.push(item.id);
            alerts.push({
              id: `alert-${Date.now()}-${item.id}-2fa`,
              type: 'missing_2fa',
              severity: 'medium',
              itemId: item.id,
              itemTitle: item.title,
              description: '建议为该账户开启双重验证',
            });
          }

          if (item.url) {
            const domain = new URL(item.url).hostname;
            if (leakedDomains.some(leaked => domain.includes(leaked))) {
              alerts.push({
                id: `alert-${Date.now()}-${item.id}-breach`,
                type: 'compromised',
                severity: 'high',
                itemId: item.id,
                itemTitle: item.title,
                description: '该网站曾发生数据泄露，建议立即更改密码',
              });
            }
          }
        }

        if (item.type === 'credit_card' && item.expiryDate) {
          const [month, year] = item.expiryDate.split('/').map(Number);
          let expiryDate: Date;
          if (!isNaN(month) && !isNaN(year)) {
            const fullYear = year >= 100 ? year : year + 2000;
            expiryDate = new Date(fullYear, month, 0);
          } else {
            expiryDate = new Date(item.expiryDate);
          }
          const now = new Date();
          const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
          
          if (isNaN(expiryDate.getTime())) {
            return;
          }
          
          if (expiryDate < now) {
            alerts.push({
              id: `alert-${Date.now()}-${item.id}-expired`,
              type: 'expired',
              severity: 'high',
              itemId: item.id,
              itemTitle: item.title,
              description: '信用卡已过期，请更新',
            });
          } else if (expiryDate < threeMonthsLater) {
            alerts.push({
              id: `alert-${Date.now()}-${item.id}-expired`,
              type: 'expired',
              severity: 'medium',
              itemId: item.id,
              itemTitle: item.title,
              description: '信用卡即将过期',
            });
          }
        }
      });

      const reusedPasswords = Array.from(reusedPasswordMap.values())
        .filter(ids => ids.length > 1)
        .flat();

      reusedPasswords.forEach((itemId, index) => {
        if (index === 0 || reusedPasswords[index - 1] !== itemId) {
          const item = items.find(i => i.id === itemId);
          if (item) {
            alerts.push({
              id: `alert-${Date.now()}-${itemId}-reused`,
              type: 'reused',
              severity: 'high',
              itemId: item.id,
              itemTitle: item.title,
              description: '该密码在多个账户中重复使用，一旦泄露将影响所有账户',
            });
          }
        }
      });

      const compromisedCount = alerts.filter(a => a.type === 'compromised').length;
      const expiredCount = alerts.filter(a => a.type === 'expired').length;

      const totalScore = 100 - 
        (weakPasswords.length * 5) - 
        (reusedPasswords.length * 10) - 
        (compromisedCount * 15) - 
        (missing2FA.length * 3);

      const summary: WatchtowerSummary = {
        score: Math.max(0, Math.min(100, totalScore)),
        weakPasswords: weakPasswords.length,
        reusedPasswords: Array.from(reusedPasswordMap.values()).filter(ids => ids.length > 1).length,
        compromisedPasswords: compromisedCount,
        expiredItems: expiredCount,
        missing2FA: missing2FA.length,
      };

      set((state) => ({
        watchtower: { ...state.watchtower, summary, alerts },
      }));
    },
  },

  // ---------- 密码生成器切片 ----------
  generator: {
    length: 20,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    readable: false,
    passphrase: false,
    excludeAmbiguous: false,
    noConsecutive: false,
    noRepeat: false,
    generatedPassword: generateRandomPassword(20, true, true, true, true, false, false, false, false),
    passwordStrength: calculatePasswordStrength(generateRandomPassword(20, true, true, true, true, false, false, false, false)),
    history: [],

    setLength: (length) => {
      set((state) => ({
        generator: { ...state.generator, length },
      }));
    },

    setUppercase: (value) => {
      set((state) => ({
        generator: { ...state.generator, uppercase: value },
      }));
    },

    setLowercase: (value) => {
      set((state) => ({
        generator: { ...state.generator, lowercase: value },
      }));
    },

    setDigits: (value) => {
      set((state) => ({
        generator: { ...state.generator, digits: value },
      }));
    },

    setSymbols: (value) => {
      set((state) => ({
        generator: { ...state.generator, symbols: value },
      }));
    },

    setReadable: (value) => {
      set((state) => ({
        generator: { ...state.generator, readable: value },
      }));
    },

    setPassphrase: (value) => {
      set((state) => ({
        generator: { ...state.generator, passphrase: value },
      }));
    },

    setExcludeAmbiguous: (value) => {
      set((state) => ({
        generator: { ...state.generator, excludeAmbiguous: value },
      }));
    },

    setNoConsecutive: (value) => {
      set((state) => ({
        generator: { ...state.generator, noConsecutive: value },
      }));
    },

    setNoRepeat: (value) => {
      set((state) => ({
        generator: { ...state.generator, noRepeat: value },
      }));
    },

    generatePassword: () => {
      const { length, uppercase, lowercase, digits, symbols, readable, passphrase, excludeAmbiguous, noConsecutive, noRepeat } = get().generator;
      const password = passphrase
        ? generatePassphrase()
        : generateRandomPassword(length, uppercase, lowercase, digits, symbols, readable, excludeAmbiguous, noConsecutive, noRepeat);
      const strength = calculatePasswordStrength(password);
      
      const historyEntry: GeneratedPasswordHistory = {
        id: `gen-${Date.now()}`,
        password,
        type: passphrase ? 'passphrase' : 'password',
        length: password.length,
        createdAt: new Date().toISOString(),
        strength,
      };
      
      set((state) => ({
        generator: {
          ...state.generator,
          generatedPassword: password,
          passwordStrength: strength,
          history: [historyEntry, ...state.generator.history].slice(0, 50),
        },
      }));
    },

    addToHistory: (password, type, length) => {
      const strength = calculatePasswordStrength(password);
      const historyEntry: GeneratedPasswordHistory = {
        id: `gen-${Date.now()}`,
        password,
        type,
        length,
        createdAt: new Date().toISOString(),
        strength,
      };
      set((state) => ({
        generator: {
          ...state.generator,
          history: [historyEntry, ...state.generator.history].slice(0, 50),
        },
      }));
    },

    clearHistory: () => {
      set((state) => ({
        generator: { ...state.generator, history: [] },
      }));
    },

    removeFromHistory: (id) => {
      set((state) => ({
        generator: {
          ...state.generator,
          history: state.generator.history.filter((h) => h.id !== id),
        },
      }));
    },

    calculateStrength: (password) => {
      return calculatePasswordStrength(password);
    },
  },

  // ---------- UI 切片 ----------
  ui: {
    sidebarCollapsed: false,
    theme: 'system' as const,
    language: (() => {
      try {
        const stored = localStorage.getItem('vaultkey-language');
        return stored === 'en' ? 'en' : 'zh';
      } catch {
        return 'zh';
      }
    })(),

    toggleSidebar: () => {
      set((state) => ({
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      }));
    },

    setTheme: (theme) => {
      set((state) => ({
        ui: { ...state.ui, theme },
      }));
    },

    setLanguage: (language) => {
      try {
        localStorage.setItem('vaultkey-language', language);
      } catch (error) {
        console.warn('localStorage operation failed:', error);
      }
      set((state) => ({
        ui: { ...state.ui, language },
      }));
    },
  },

  // ---------- 设置切片 ----------
  settings: {
    settings: mockSettings,
    recoveryKeys: mockRecoveryKeys,
    emergencyAccess: mockEmergencyAccess,

    updateSettings: (updates) => {
      set((state) => ({
        settings: { ...state.settings, settings: { ...state.settings.settings, ...updates } },
      }));
      // 同步剪贴板设置到 localStorage
      if (updates.clipboardClearSeconds !== undefined) {
        try {
          const existing = localStorage.getItem('vaultkey-settings');
          const parsed = existing ? JSON.parse(existing) : {};
          parsed.clipboardClearSeconds = updates.clipboardClearSeconds;
          localStorage.setItem('vaultkey-settings', JSON.stringify(parsed));
        } catch (error) {
          console.warn('localStorage operation failed:', error);
        }
      }
    },

    toggleTravelMode: () => {
      set((state) => {
        const enabling = !state.settings.settings.travelModeEnabled;
        const hiddenVaultIds = enabling
          ? state.vaults.list.filter((v) => v.isHidden).map((v) => v.id)
          : [];
        return {
          settings: {
            ...state.settings,
            settings: {
              ...state.settings.settings,
              travelModeEnabled: enabling,
              hiddenVaultIds,
            },
          },
        };
      });
    },

    generateRecoveryKey: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const key = Array.from({ length: 8 }, () => {
        const arr = new Uint32Array(5);
        getRandomValues(arr);
        return Array.from(arr, (v) => chars[v % chars.length]).join('');
      }).join('-');
      const newKey: RecoveryKey = {
        id: `recovery-${Date.now()}`,
        key,
        createdAt: new Date().toISOString(),
        used: false,
      };
      set((state) => ({
        settings: { ...state.settings, recoveryKeys: [...state.settings.recoveryKeys, newKey] },
      }));
      return newKey;
    },

    updateEmergencyAccess: (access: EmergencyAccess[]) => {
      set((state) => ({
        settings: { ...state.settings, emergencyAccess: access },
      }));
    },

    addAllowedDomain: (domain: string) => {
      set((state) => ({
        settings: {
          ...state.settings,
          settings: {
            ...state.settings.settings,
            allowedDomains: [...state.settings.settings.allowedDomains, domain],
          },
        },
      }));
    },

    removeAllowedDomain: (domain: string) => {
      set((state) => ({
        settings: {
          ...state.settings,
          settings: {
            ...state.settings.settings,
            allowedDomains: state.settings.settings.allowedDomains.filter((d) => d !== domain),
          },
        },
      }));
    },

    addBlockedDomain: (domain: string) => {
      set((state) => ({
        settings: {
          ...state.settings,
          settings: {
            ...state.settings.settings,
            blockedDomains: [...state.settings.settings.blockedDomains, domain],
          },
        },
      }));
    },

    removeBlockedDomain: (domain: string) => {
      set((state) => ({
        settings: {
          ...state.settings,
          settings: {
            ...state.settings.settings,
            blockedDomains: state.settings.settings.blockedDomains.filter((d) => d !== domain),
          },
        },
      }));
    },

    setMatchMode: (mode: 'exact' | 'fuzzy') => {
      set((state) => ({
        settings: {
          ...state.settings,
          settings: {
            ...state.settings.settings,
            matchMode: mode,
          },
        },
      }));
    },
  },

  // ---------- 用户资料切片 ----------
  profile: {
    profile: mockProfile,
    devices: mockDevices,

    removeDevice: (deviceId: string) => {
      set((state) => ({
        profile: {
          ...state.profile,
          devices: state.profile.devices.filter((d) => d.id !== deviceId),
        },
      }));
    },
  },

  // ---------- 管理员设置切片 ----------
  admin: {
    settings: mockAdminSettings,

    updateSiteInfo: (updates) => {
      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            siteInfo: { ...state.admin.settings.siteInfo, ...updates },
          },
        },
      }));
    },

    generateRedeemCode: (planType, expiresAtDate, totalUses, subscriptionDays, customCode) => {
      const now = new Date();
      // expiresAtDate 是 YYYY-MM-DD 格式，设置为当天 23:59:59
      const expiresAt = `${expiresAtDate}T23:59:59Z`;
      const code = customCode || Array.from({ length: 12 }, () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const arr = new Uint32Array(1);
        getRandomValues(arr);
        return chars[arr[0] % chars.length];
      }).join('');
      const newCode: RedeemCode = {
        id: `redeem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code,
        planType: planType as Subscription['plan'],
        totalUses,
        usedCount: 0,
        expiresAt,
        enabled: true,
        createdAt: now.toISOString(),
        subscriptionDays,
      };
      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            redeemCodes: [...state.admin.settings.redeemCodes, newCode],
          },
        },
      }));
      return newCode;
    },

    toggleRedeemCode: (id) => {
      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            redeemCodes: state.admin.settings.redeemCodes.map((rc) =>
              rc.id === id ? { ...rc, enabled: !rc.enabled } : rc
            ),
          },
        },
      }));
    },

    deleteRedeemCode: (id) => {
      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            redeemCodes: state.admin.settings.redeemCodes.filter((rc) => rc.id !== id),
          },
        },
      }));
    },

    updateNotificationConfig: (config) => {
      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            notificationConfig: { ...state.admin.settings.notificationConfig, ...config },
          },
        },
      }));
    },
  },

  // ---------- 通知切片 ----------
  notifications: {
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter((n) => !n.read).length,

    addNotification: (notification) => {
      const now = new Date().toISOString();
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: now,
      };
      set((state) => ({
        notifications: {
          ...state.notifications,
          notifications: [newNotification, ...state.notifications.notifications],
          unreadCount: state.notifications.unreadCount + 1,
        },
      }));
    },

    markAsRead: (id) => {
      set((state) => {
        const notification = state.notifications.notifications.find((n) => n.id === id);
        if (!notification || notification.read) return state;
        return {
          notifications: {
            ...state.notifications,
            notifications: state.notifications.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.notifications.unreadCount - 1),
          },
        };
      });
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: {
          ...state.notifications,
          notifications: state.notifications.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        },
      }));
    },

    clearNotification: (id) => {
      set((state) => {
        const notification = state.notifications.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.read;
        return {
          notifications: {
            ...state.notifications,
            notifications: state.notifications.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.notifications.unreadCount - 1)
              : state.notifications.unreadCount,
          },
        };
      });
    },

    clearAll: () => {
      set((state) => ({
        notifications: {
          ...state.notifications,
          notifications: [],
          unreadCount: 0,
        },
      }));
    },
  },

  // ---------- 订阅切片 ----------
  subscription: {
    subscription: mockSubscription,

    applyRedeemCode: (code) => {
      const currentRedeemCodes = get().admin.settings.redeemCodes;
      const redeemCode = currentRedeemCodes.find(
        (rc) => rc.code.toUpperCase() === code.trim().toUpperCase()
      );

      if (!redeemCode) {
        return { success: false, message: '兑换码不存在' };
      }

      if (!redeemCode.enabled) {
        return { success: false, message: '兑换码已被禁用' };
      }

      const now = new Date();
      if (new Date(redeemCode.expiresAt) < now) {
        return { success: false, message: '兑换码已过期' };
      }

      if (redeemCode.usedCount >= redeemCode.totalUses) {
        return { success: false, message: '兑换码使用次数已达上限' };
      }

      // 更新兑换码使用次数
      const updatedRedeemCodes = currentRedeemCodes.map((rc) =>
        rc.id === redeemCode.id ? { ...rc, usedCount: rc.usedCount + 1 } : rc
      );

      // 更新用户订阅，使用兑换码的 subscriptionDays
      const subscriptionDays = redeemCode.subscriptionDays || 30;
      const expiresAt = new Date(now.getTime() + subscriptionDays * 24 * 60 * 60 * 1000).toISOString();
      const newSubscription: Subscription = {
        plan: redeemCode.planType,
        startAt: now.toISOString(),
        expiresAt,
        source: 'redeemed',
        redeemCodeId: redeemCode.id,
      };

      set((state) => ({
        admin: {
          ...state.admin,
          settings: {
            ...state.admin.settings,
            redeemCodes: updatedRedeemCodes,
          },
        },
        subscription: {
          ...state.subscription,
          subscription: newSubscription,
        },
        profile: {
          ...state.profile,
          profile: {
            ...state.profile.profile,
            plan: redeemCode.planType,
            subscription: newSubscription,
          },
        },
      }));

      return { success: true, message: `兑换成功！已升级至 ${redeemCode.planType} 计划，有效期 ${subscriptionDays} 天` };
    },
  },
}));

// ==================== 选择器钩子 ====================

/** 认证状态选择器 */
export const useAuth = () =>
  useStore((state) => state.auth);

/** 保险库状态选择器 */
export const useVaults = () =>
  useStore((state) => state.vaults);

/** 文件夹状态选择器 */
export const useFolders = () =>
  useStore((state) => state.folders);

/** 条目状态选择器 */
export const useItems = () =>
  useStore((state) => state.items);

/** 安全瞭望塔状态选择器 */
export const useWatchtower = () =>
  useStore((state) => state.watchtower);

/** 密码生成器状态选择器 */
export const useGenerator = () =>
  useStore((state) => state.generator);

/** UI 状态选择器 */
export const useUI = () =>
  useStore((state) => state.ui);

/** 设置状态选择器 */
export const useSettings = () =>
  useStore((state) => state.settings);

/** 用户资料状态选择器 */
export const useProfile = () =>
  useStore((state) => state.profile);

/** 管理员设置状态选择器 */
export const useAdmin = () =>
  useStore((state) => state.admin);

/** 通知状态选择器 */
export const useNotifications = () =>
  useStore((state) => state.notifications);

/** 订阅状态选择器 */
export const useSubscription = () =>
  useStore((state) => state.subscription);

// 同时提供命名导出和默认导出，兼容不同导入方式
export { useStore };
export default useStore;
