/**
 * VaultKey 后台服务工作者 (Service Worker)
 * 负责数据管理、加密解密、消息通信、自动锁定和右键菜单
 */

// ===== 配置常量 =====
const VAULTKEY_API = 'https://vaultkey.app/api';  // Web 应用 API 地址
const AUTO_LOCK_MINUTES = 15;                      // 默认自动锁定时间（分钟）
const SYNC_INTERVAL_MINUTES = 30;                  // 数据同步间隔（分钟）

// ===== 状态管理 =====
let vaultState = {
  locked: true,            // 密码库是否锁定
  masterKeyHash: null,     // 主密码哈希（用于验证）
  encryptionKey: null,     // 加密密钥（内存中，锁定时清除）
  lastActivity: Date.now(),// 最后活动时间
  items: [],               // 解密后的密码项缓存
  pendingSave: null,       // 待保存的凭据
};

// ===== 扩展安装/启动 =====

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 首次安装：初始化存储
    await chrome.storage.local.set({
      vaultLocked: true,
      masterKeyHash: null,
      encryptedItems: [],
      settings: {
        autoLockMinutes: AUTO_LOCK_MINUTES,
        syncEnabled: false,
        serverUrl: VAULTKEY_API,
        neverSaveDomains: [],
      }
    });
  }

  // 设置右键菜单
  setupContextMenus();

  // 设置自动锁定定时器
  setupAutoLock();

  // 设置数据同步定时器
  setupSync();

  // 更新徽章
  updateBadge();
});

// Service Worker 启动时恢复状态
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get('vaultLocked');
  vaultState.locked = data.vaultLocked !== false;
  vaultState.items = [];
  vaultState.encryptionKey = null;
  setupContextMenus();
  setupAutoLock();
  setupSync();
  updateBadge();
});

// ===== 右键菜单 =====

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // 填充密码
    chrome.contextMenus.create({
      id: 'vk-fill-credentials',
      title: 'VaultKey: 填充密码',
      contexts: ['page', 'frame', 'editable']
    });

    // 生成密码
    chrome.contextMenus.create({
      id: 'vk-generate-password',
      title: 'VaultKey: 生成密码',
      contexts: ['page', 'frame', 'editable']
    });

    // 保存登录
    chrome.contextMenus.create({
      id: 'vk-save-login',
      title: 'VaultKey: 保存登录',
      contexts: ['page', 'frame']
    });
  });
}

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'vk-fill-credentials':
      await handleContextMenuFill(tab);
      break;

    case 'vk-generate-password':
      await handleContextMenuGenerate(tab);
      break;

    case 'vk-save-login':
      await handleContextMenuSave(tab);
      break;
  }
});

/** 右键菜单：填充密码 */
async function handleContextMenuFill(tab) {
  if (vaultState.locked) {
    // 密码库锁定，通知内容脚本显示提示
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_MINI_NOTIFICATION',
      text: '请先解锁 VaultKey 密码库'
    }).catch(() => {});
    return;
  }

  const credentials = await getCredentialsForUrl(tab.url);
  if (credentials.length === 0) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_MINI_NOTIFICATION',
      text: '未找到匹配的登录信息'
    }).catch(() => {});
    return;
  }

  // 自动填充第一个匹配项
  const cred = credentials[0];
  chrome.tabs.sendMessage(tab.id, {
    type: 'FILL_CREDENTIALS',
    username: cred.username,
    password: cred.password
  }).catch(() => {});
}

/** 右键菜单：生成密码 */
async function handleContextMenuGenerate(tab) {
  const password = generatePassword(16, true, true, true, true);
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_CREDENTIALS',
      password: password
    });
  } catch (err) {
    // 无法填充到页面，复制到剪贴板
    // MV3 中使用 offscreen document 复制，这里简化处理
    console.log('生成密码:', password);
  }
}

/** 右键菜单：保存登录 */
async function handleContextMenuSave(tab) {
  chrome.tabs.sendMessage(tab.id, {
    type: 'DETECT_FORMS'
  }).catch(() => {});
}

// ===== 自动锁定 =====

function setupAutoLock() {
  // 使用 chrome.alarms 定时检查
  chrome.alarms.create('autoLock', {
    periodInMinutes: 1 // 每分钟检查一次
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'autoLock') {
    await checkAutoLock();
  } else if (alarm.name === 'syncData') {
    await syncData();
  }
});

/** 检查是否需要自动锁定 */
async function checkAutoLock() {
  if (vaultState.locked) return;

  const data = await chrome.storage.local.get('settings');
  const settings = data.settings || {};
  const autoLockMinutes = settings.autoLockMinutes || AUTO_LOCK_MINUTES;

  const elapsed = (Date.now() - vaultState.lastActivity) / 1000 / 60;
  if (elapsed >= autoLockMinutes) {
    await lockVault();
  }
}

// ===== 数据同步 =====

function setupSync() {
  chrome.alarms.create('syncData', {
    periodInMinutes: SYNC_INTERVAL_MINUTES
  });
}

/** 与 Web 应用 API 同步数据 */
async function syncData() {
  if (vaultState.locked) return;

  const data = await chrome.storage.local.get('settings');
  const settings = data.settings || {};

  if (!settings.syncEnabled || !settings.authToken) return;

  try {
    // 从服务器拉取最新数据
    const response = await fetch(`${settings.serverUrl}/vault/sync`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`同步失败: ${response.status}`);

    const serverData = await response.json();

    if (serverData.encryptedItems) {
      // 更新本地存储
      await chrome.storage.local.set({
        encryptedItems: serverData.encryptedItems
      });

      // 如果已解锁，重新解密
      if (vaultState.encryptionKey) {
        vaultState.items = decryptItems(serverData.encryptedItems, vaultState.encryptionKey);
      }
    }
  } catch (err) {
    console.error('VaultKey 同步失败:', err);
  }
}

// ===== 消息处理 =====

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 记录活动时间
  if (!vaultState.locked) {
    vaultState.lastActivity = Date.now();
  }

  switch (message.type) {
    case 'GET_VAULT_STATUS':
      handleGetVaultStatus(sendResponse);
      break;

    case 'UNLOCK_VAULT':
      handleUnlockVault(message, sendResponse);
      break;

    case 'LOCK_VAULT':
      handleLockVault(sendResponse);
      break;

    case 'GET_ITEMS':
      handleGetItems(sendResponse);
      break;

    case 'GET_ITEM_PASSWORD':
      handleGetItemPassword(message, sendResponse);
      break;

    case 'GET_CREDENTIALS_FOR_URL':
      handleGetCredentialsForUrl(message, sender, sendResponse);
      break;

    case 'CHECK_SAVE_CREDENTIALS':
      handleCheckSaveCredentials(message, sender, sendResponse);
      break;

    case 'SAVE_CREDENTIALS_CONFIRM':
      handleSaveCredentialsConfirm(sendResponse);
      break;

    case 'SAVE_CREDENTIALS_NEVER':
      handleSaveCredentialsNever(message, sender, sendResponse);
      break;

    case 'GENERATE_PASSWORD':
      handleGeneratePassword(message, sendResponse);
      break;

    case 'UPDATE_SETTINGS':
      handleUpdateSettings(message, sendResponse);
      break;

    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      break;

    default:
      sendResponse({ error: '未知消息类型' });
  }

  // 返回 true 表示异步响应
  return true;
});

/** 获取密码库状态 */
function handleGetVaultStatus(sendResponse) {
  sendResponse({
    locked: vaultState.locked,
    itemCount: vaultState.items.length
  });
}

/** 解锁密码库 */
async function handleUnlockVault(message, sendResponse) {
  const { masterPassword } = message;
  if (!masterPassword) {
    sendResponse({ success: false, error: '请输入主密码' });
    return;
  }

  try {
    const data = await chrome.storage.local.get(['masterKeyHash', 'encryptedItems']);

    // 首次使用：设置主密码
    if (!data.masterKeyHash) {
      const keyHash = await hashPassword(masterPassword);
      await chrome.storage.local.set({ masterKeyHash: keyHash, vaultLocked: false });

      vaultState.masterKeyHash = keyHash;
      vaultState.encryptionKey = await deriveKey(masterPassword);
      vaultState.items = [];
      vaultState.locked = false;
      vaultState.lastActivity = Date.now();

      updateBadge();
      sendResponse({ success: true });
      return;
    }

    // 验证主密码
    const inputHash = await hashPassword(masterPassword);
    if (inputHash !== data.masterKeyHash) {
      sendResponse({ success: false, error: '主密码错误' });
      return;
    }

    // 解锁成功
    vaultState.encryptionKey = await deriveKey(masterPassword);
    vaultState.masterKeyHash = data.masterKeyHash;

    // 解密密码项
    if (data.encryptedItems && data.encryptedItems.length > 0) {
      vaultState.items = decryptItems(data.encryptedItems, vaultState.encryptionKey);
    } else {
      vaultState.items = [];
    }

    vaultState.locked = false;
    vaultState.lastActivity = Date.now();

    await chrome.storage.local.set({ vaultLocked: false });
    updateBadge();

    sendResponse({ success: true });
  } catch (err) {
    console.error('解锁失败:', err);
    sendResponse({ success: false, error: '解锁过程中出错' });
  }
}

/** 锁定密码库 */
async function lockVault() {
  vaultState.locked = true;
  vaultState.encryptionKey = null;
  vaultState.items = [];
  vaultState.lastActivity = Date.now();

  await chrome.storage.local.set({ vaultLocked: true });
  updateBadge();
}

function handleLockVault(sendResponse) {
  lockVault();
  sendResponse({ success: true });
}

/** 获取所有密码项 */
function handleGetItems(sendResponse) {
  if (vaultState.locked) {
    sendResponse({ items: [] });
    return;
  }

  // 返回不含密码的列表
  const safeItems = vaultState.items.map(item => ({
    id: item.id,
    title: item.title,
    username: item.username,
    url: item.url,
    category: item.category,
    updatedAt: item.updatedAt
  }));

  sendResponse({ items: safeItems });
}

/** 获取指定密码项的密码 */
function handleGetItemPassword(message, sendResponse) {
  if (vaultState.locked) {
    sendResponse({ error: '密码库已锁定' });
    return;
  }

  const item = vaultState.items.find(i => i.id === message.itemId);
  if (item) {
    sendResponse({ password: item.password, username: item.username });
  } else {
    sendResponse({ error: '未找到该密码项' });
  }
}

/** 根据 URL 获取匹配的凭据 */
function handleGetCredentialsForUrl(message, sender, sendResponse) {
  if (vaultState.locked) {
    sendResponse({ credentials: [] });
    return;
  }

  const targetUrl = message.url || '';
  const credentials = getCredentialsForUrl(targetUrl);

  sendResponse({ credentials });
}

/** 根据 URL 匹配凭据的逻辑 */
function getCredentialsForUrl(url) {
  try {
    const targetHost = new URL(url).hostname;

    return vaultState.items.filter(item => {
      if (!item.url) return false;
      try {
        const itemHost = new URL(item.url).hostname;
        // 匹配主域名（如 a.example.com 匹配 example.com）
        return targetHost === itemHost ||
               targetHost.endsWith('.' + itemHost) ||
               itemHost.endsWith('.' + targetHost);
      } catch {
        return false;
      }
    }).map(item => ({
      id: item.id,
      title: item.title,
      username: item.username,
      password: item.password
    }));
  } catch {
    return [];
  }
}

/** 检查是否需要保存凭据 */
async function handleCheckSaveCredentials(message, sender, sendResponse) {
  const { url, username, password } = message;

  if (!password) {
    sendResponse({ needSave: false });
    return;
  }

  // 检查是否在"永不保存"列表中
  const data = await chrome.storage.local.get('settings');
  const settings = data.settings || {};
  const neverSaveDomains = settings.neverSaveDomains || [];

  try {
    const host = new URL(url).hostname;
    if (neverSaveDomains.some(d => host === d || host.endsWith('.' + d))) {
      sendResponse({ needSave: false });
      return;
    }
  } catch {}

  // 检查是否已存在相同凭据
  const existing = vaultState.items.find(item =>
    item.username === username && item.url && urlIncludes(url, item.url)
  );

  if (existing) {
    // 如果密码不同，可能是密码已更新
    if (existing.password !== password) {
      vaultState.pendingSave = {
        url,
        username,
        password,
        isUpdate: true,
        existingId: existing.id
      };

      // 通知内容脚本显示更新提示
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'SHOW_SAVE_NOTIFICATION',
          username: username || '未知用户'
        }).catch(() => {});
      }
    }
    sendResponse({ needSave: false });
    return;
  }

  // 新凭据，需要保存
  if (vaultState.locked) {
    sendResponse({ needSave: false });
    return;
  }

  vaultState.pendingSave = {
    url,
    username,
    password,
    isUpdate: false
  };

  // 通知内容脚本显示保存提示
  if (sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'SHOW_SAVE_NOTIFICATION',
      username: username || '未知用户'
    }).catch(() => {});
  }

  sendResponse({ needSave: true });
}

/** 用户确认保存凭据 */
async function handleSaveCredentialsConfirm(sendResponse) {
  if (!vaultState.pendingSave) {
    sendResponse({ success: false });
    return;
  }

  const { url, username, password, isUpdate, existingId } = vaultState.pendingSave;

  try {
    if (isUpdate && existingId) {
      // 更新已有密码项
      const index = vaultState.items.findIndex(i => i.id === existingId);
      if (index !== -1) {
        vaultState.items[index].password = password;
        vaultState.items[index].updatedAt = new Date().toISOString();
      }
    } else {
      // 添加新密码项
      const newItem = {
        id: generateId(),
        title: extractDomain(url),
        username: username || '',
        password: password,
        url: url,
        category: 'login',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      vaultState.items.push(newItem);
    }

    // 加密并保存
    await saveEncryptedItems();

    vaultState.pendingSave = null;
    sendResponse({ success: true });
  } catch (err) {
    console.error('保存凭据失败:', err);
    sendResponse({ success: false, error: '保存失败' });
  }
}

/** 用户选择"永不保存" */
async function handleSaveCredentialsNever(message, sender, sendResponse) {
  if (!vaultState.pendingSave) {
    sendResponse({ success: true });
    return;
  }

  try {
    const host = new URL(vaultState.pendingSave.url).hostname;
    const data = await chrome.storage.local.get('settings');
    const settings = data.settings || {};
    const neverSaveDomains = settings.neverSaveDomains || [];

    if (!neverSaveDomains.includes(host)) {
      neverSaveDomains.push(host);
      settings.neverSaveDomains = neverSaveDomains;
      await chrome.storage.local.set({ settings });
    }

    vaultState.pendingSave = null;
    sendResponse({ success: true });
  } catch (err) {
    sendResponse({ success: false });
  }
}

/** 生成密码 */
function handleGeneratePassword(message, sendResponse) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true
  } = message.options || {};

  const password = generatePassword(length, uppercase, lowercase, numbers, symbols);
  sendResponse({ password });
}

/** 更新设置 */
async function handleUpdateSettings(message, sendResponse) {
  const data = await chrome.storage.local.get('settings');
  const settings = { ...data.settings, ...message.settings };
  await chrome.storage.local.set({ settings });
  sendResponse({ success: true });
}

/** 获取设置 */
async function handleGetSettings(sendResponse) {
  const data = await chrome.storage.local.get('settings');
  sendResponse({ settings: data.settings || {} });
}

// ===== 键盘快捷键 =====

chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'fill_credentials':
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await handleContextMenuFill(tab);
      }
      break;
  }
});

// ===== 徽章更新 =====

function updateBadge() {
  if (vaultState.locked) {
    chrome.action.setBadgeText({ text: '🔒' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF4757' });
  } else {
    chrome.action.setBadgeText({ text: '' + vaultState.items.length });
    chrome.action.setBadgeBackgroundColor({ color: '#00D4AA' });
  }
}

// ===== 加密/解密 =====

/**
 * 使用 Web Crypto API 派生加密密钥
 * 基于 PBKDF2 + SHA-256
 */
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // 使用固定盐值（生产环境应使用随机盐并存储）
  const salt = encoder.encode('VaultKey-salt-v1');

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 哈希主密码（用于验证）
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'VaultKey-hash-v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 加密单个数据项
 */
async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
}

/**
 * 解密单个数据项
 */
async function decryptData(encryptedObj, key) {
  const iv = new Uint8Array(encryptedObj.iv);
  const data = new Uint8Array(encryptedObj.data);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}

/**
 * 批量解密密码项
 */
function decryptItems(encryptedItems, key) {
  // 注意：Service Worker 中不能使用 async 的 map，需要特殊处理
  // 这里用 Promise.all 来处理
  return Promise.all(
    encryptedItems.map(item => decryptData(item, key))
  ).catch(err => {
    console.error('解密失败:', err);
    return [];
  });
}

/**
 * 批量加密密码项并保存到 storage
 */
async function saveEncryptedItems() {
  if (!vaultState.encryptionKey) return;

  const encryptedItems = await Promise.all(
    vaultState.items.map(item => encryptData(item, vaultState.encryptionKey))
  );

  await chrome.storage.local.set({ encryptedItems });
  updateBadge();
}

// ===== 密码生成 =====

/**
 * 生成随机密码
 * @param {number} length - 密码长度
 * @param {boolean} useUpper - 包含大写字母
 * @param {boolean} useLower - 包含小写字母
 * @param {boolean} useNumbers - 包含数字
 * @param {boolean} useSymbols - 包含特殊符号
 */
function generatePassword(length = 16, useUpper = true, useLower = true, useNumbers = true, useSymbols = true) {
  let chars = '';
  let required = [];

  if (useUpper) {
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    required.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  }
  if (useLower) {
    chars += 'abcdefghijklmnopqrstuvwxyz';
    required.push('abcdefghijklmnopqrstuvwxyz');
  }
  if (useNumbers) {
    chars += '0123456789';
    required.push('0123456789');
  }
  if (useSymbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    required.push('!@#$%^&*()_+-=[]{}|;:,.<>?');
  }

  if (!chars) {
    chars = 'abcdefghijklmnopqrstuvwxyz';
    required = ['abcdefghijklmnopqrstuvwxyz'];
  }

  // 确保每种类型至少一个字符
  let password = '';
  for (const req of required) {
    password += req[Math.floor(Math.random() * req.length)];
  }

  // 填充到指定长度
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // 打乱顺序
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return password;
}

// ===== 工具函数 =====

/** 生成唯一 ID */
function generateId() {
  return 'vk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/** 从 URL 提取域名作为标题 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** 检查 URL 是否包含目标 */
function urlIncludes(url, target) {
  try {
    const host1 = new URL(url).hostname;
    const host2 = new URL(target).hostname;
    return host1 === host2 || host1.endsWith('.' + host2) || host2.endsWith('.' + host1);
  } catch {
    return url.includes(target);
  }
}
