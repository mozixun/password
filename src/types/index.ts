// VaultKey 密码管理器 - 项目类型定义

export type ItemType = 'login' | 'credit_card' | 'identity' | 'note' | 'ssh_key' | 'document' | 'passkey' | 'totp_authenticator' | 'license' | 'id_card' | 'database' | 'api_key';

// 自定义字段类型
export type CustomFieldType = 'text' | 'password' | 'select' | 'multi_select' | 'date' | 'private_note';

// 自定义字段定义
export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  value: string | string[];
  options?: string[];           // 单选/多选的选项列表
  required?: boolean;
  isPrivate?: boolean;          // 是否为私密字段（编辑模式外不显示）
}

// TOTP 验证器配置
export interface TOTPConfig {
  secret: string;           // Base32 编码的密钥
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';  // 哈希算法
  digits: number;           // 验证码位数 (通常为 6 或 8)
  period: number;           // 有效期秒数 (通常为 30 或 60)
  issuer?: string;          // 服务提供商名称
  account?: string;         // 账户名称
}

// Passkey 通行密钥配置
export interface PasskeyConfig {
  credentialId: string;     // 凭据 ID (Base64URL 编码)
  publicKey: string;        // 公钥 (COSE 格式, Base64URL 编码)
  signCount: number;        // 签名计数 (用于检测克隆)
  aaguid?: string;          // 认证器 AAGUID
  transports?: string[];    // 支持的传输方式 (usb, nfc, bluetooth, internal)
  userHandle?: string;      // 用户句柄
  rpId: string;             // 依赖方 ID (网站域名)
  deviceType: 'single_device' | 'multi_device';  // 设备类型
  backedUp?: boolean;       // 是否已备份
  createdAtAuthenticator?: string;  // 认证器创建时间
  lastUsedAt?: string;      // 最后使用时间
}

// License 序列号字段
export interface LicenseConfig {
  serialNumber: string;
  productName: string;
  licenseType: 'perpetual' | 'subscription' | 'trial';
  expiryDate?: string;
  activationStatus?: 'active' | 'expired' | 'pending';
  numberOfSeats?: number;
  issuedTo?: string;
  issuer?: string;
}

// 数据库连接配置
export interface DatabaseConfig {
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  databaseType: 'mysql' | 'postgresql' | 'mongodb' | 'redis' | 'sqlite';
  connectionString?: string;
}

// API Key 配置
export interface APIKeyConfig {
  apiKey: string;
  apiSecret?: string;
  provider: string;
  scopes?: string[];
  expiryDate?: string;
  status?: 'active' | 'revoked';
}

// 身份证配置
export interface IdCardConfig {
  idNumber: string;
  name: string;
  gender: 'male' | 'female';
  nationality: string;
  birthDate: string;
  address: string;
  issueDate: string;
  expiryDate?: string;
}

export interface ShareRecord {
  id: string;
  email: string;
  permission: 'view' | 'edit';
  createdAt: string;
}

export interface VaultItem {
  id: string;
  vaultId: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  favorite: boolean;
  tags: string[];
  folderId?: string;         // 所属文件夹
  isPinned?: boolean;         // 是否置顶
  usageCount?: number;        // 使用次数
  lastUsedAt?: string;       // 最后使用时间
  createdAt: string;
  updatedAt: string;
  trashedAt?: string;
  sharedWith?: ShareRecord[];
  
  // 登录字段
  username?: string;
  password?: string;
  url?: string;
  totp?: string;            // 传统 TOTP URI (兼容旧数据)
  
  // 信用卡字段
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardType?: 'visa' | 'mastercard' | 'amex' | 'discover';
  
  // 身份信息字段
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  
  // 笔记字段
  content?: string;
  
  // SSH 密钥字段
  publicKey?: string;
  privateKey?: string;
  keyType?: string;
  
  // 文档字段
  fileName?: string;
  fileSize?: number;
  
  // Passkey 通行密钥字段
  passkey?: PasskeyConfig;
  website?: string;         // Passkey 关联网站 (用于显示)
  
  // TOTP 验证器字段 (独立验证器类型)
  totpConfig?: TOTPConfig;
  
  // License 序列号字段
  licenseConfig?: LicenseConfig;
  
  // 数据库连接字段
  databaseConfig?: DatabaseConfig;
  
  // API Key 字段
  apiKeyConfig?: APIKeyConfig;
  
  // 身份证字段
  idCardConfig?: IdCardConfig;
  
  // 自定义字段
  customFields?: CustomField[];
  
  // 通用字段
  notes?: string;
  attachments?: Attachment[];
  passwordHistory?: PasswordHistoryEntry[];
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  content: string;
  createdAt: string;
}

export interface PasswordHistoryEntry {
  password: string;
  changedAt: string;
}

export interface Folder {
  id: string;
  vaultId: string;
  name: string;
  parentId?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaultMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export interface Vault {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  isHidden?: boolean;
  members?: VaultMember[];
}

export interface WatchtowerSummary {
  score: number;
  weakPasswords: number;
  reusedPasswords: number;
  compromisedPasswords: number;
  expiredItems: number;
  missing2FA: number;       // 未开启2FA的数量
}

export interface SecurityAlert {
  id: string;
  type: 'weak' | 'reused' | 'compromised' | 'expired' | 'missing_2fa';
  severity: 'high' | 'medium' | 'low';
  itemId: string;
  itemTitle: string;
  description: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'web' | 'iphone' | 'mac' | 'extension';
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface UserProfile {
  email: string;
  createdAt: string;
  plan: 'free' | 'premium' | 'family' | 'team';
  avatarUrl?: string;
}

export interface RecoveryKey {
  id: string;
  key: string;
  createdAt: string;
  used: boolean;
}

export interface EmergencyAccess {
  id: string;
  trustedEmail: string;
  accessLevel: 'view' | 'edit' | 'full';
  approvalRequired: boolean;
  waitingPeriodHours: number;
  createdAt: string;
}

export interface VaultSettings {
  autoLockMinutes: number;
  failedAttemptsBeforeLock: number;
  clipboardClearSeconds: number;
  travelModeEnabled: boolean;
  hiddenVaultIds: string[];
}

export interface PasswordStrength {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string;
}

export interface GeneratedPasswordHistory {
  id: string;
  password: string;
  type: 'password' | 'passphrase';
  length: number;
  createdAt: string;
  strength: PasswordStrength;
}

export interface SiteInfo {
  name: string;
  logoUrl: string;
  description: string;
}

export interface DomainConfig {
  allowedDomains: string[];
  blockedDomains: string[];
  matchMode: 'exact' | 'fuzzy';
}

export interface TrustedDevice {
  deviceId: string;
  email: string;
  encryptedToken: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface AdminSettings {
  siteInfo: SiteInfo;
  domainConfig: DomainConfig;
}