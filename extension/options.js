/**
 * VaultKey 设置页面逻辑
 * 管理扩展配置、服务器连接和数据操作
 */

// ===== DOM 元素引用 =====
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const btnOpenWebapp = document.getElementById('btn-open-webapp');
const btnCheckConnection = document.getElementById('btn-check-connection');
const autoLockMinutes = document.getElementById('auto-lock-minutes');
const syncEnabled = document.getElementById('sync-enabled');
const btnExport = document.getElementById('btn-export');
const btnClearData = document.getElementById('btn-clear-data');
const toast = document.getElementById('toast');

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadSettings();
  checkConnection();
  bindEvents();
}

// ===== 加载设置 =====

async function loadSettings() {
  try {
    const data = await chrome.storage.local.get('settings');
    const settings = data.settings || {};

    autoLockMinutes.value = settings.autoLockMinutes || 15;
    syncEnabled.checked = settings.syncEnabled || false;
  } catch (err) {
    console.error('加载设置失败:', err);
  }
}

// ===== 事件绑定 =====

function bindEvents() {
  // 打开 Web 应用
  btnOpenWebapp.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://vaultkey.app' });
  });

  // 检查连接
  btnCheckConnection.addEventListener('click', checkConnection);

  // 自动锁定时间变更
  autoLockMinutes.addEventListener('change', saveSettings);

  // 同步开关变更
  syncEnabled.addEventListener('change', () => {
    saveSettings();
    if (syncEnabled.checked) {
      checkConnection();
    }
  });

  // 导出数据
  btnExport.addEventListener('click', handleExport);

  // 清除数据
  btnClearData.addEventListener('click', handleClearData);
}

// ===== 保存设置 =====

async function saveSettings() {
  const settings = {
    autoLockMinutes: parseInt(autoLockMinutes.value, 10) || 15,
    syncEnabled: syncEnabled.checked
  };

  try {
    // 保留现有设置中不被此页面管理的字段
    const data = await chrome.storage.local.get('settings');
    const existingSettings = data.settings || {};

    const mergedSettings = {
      ...existingSettings,
      ...settings
    };

    await chrome.storage.local.set({ settings: mergedSettings });

    // 通知后台更新设置
    chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: mergedSettings
    });

    showToast('设置已保存');
  } catch (err) {
    console.error('保存设置失败:', err);
    showToast('保存失败', true);
  }
}

// ===== 连接检查 =====

async function checkConnection() {
  statusDot.className = 'status-dot';
  statusText.textContent = '正在检查连接...';

  try {
    const data = await chrome.storage.local.get('settings');
    const settings = data.settings || {};
    const serverUrl = settings.serverUrl || 'https://vaultkey.app';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${serverUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      statusDot.className = 'status-dot connected';
      statusText.textContent = '已连接到 VaultKey 服务器';
    } else {
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = `服务器返回错误 (${response.status})`;
    }
  } catch (err) {
    statusDot.className = 'status-dot disconnected';

    if (err.name === 'AbortError') {
      statusText.textContent = '连接超时，请检查网络';
    } else {
      statusText.textContent = '无法连接到 VaultKey 服务器';
    }
  }
}

// ===== 导出数据 =====

async function handleExport() {
  try {
    const data = await chrome.storage.local.get(['encryptedItems', 'settings']);

    // 注意：导出的是加密数据，需要用户在网页端解密
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      encryptedItems: data.encryptedItems || [],
      settings: {
        autoLockMinutes: data.settings?.autoLockMinutes,
        neverSaveDomains: data.settings?.neverSaveDomains || []
      }
    };

    // 创建下载文件
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultkey-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('数据已导出');
  } catch (err) {
    console.error('导出失败:', err);
    showToast('导出失败', true);
  }
}

// ===== 清除数据 =====

async function handleClearData() {
  // 二次确认
  const confirmed = confirm(
    '确定要清除所有 VaultKey 数据吗？\n\n此操作将删除：\n- 所有保存的密码\n- 主密码\n- 所有设置\n\n此操作不可撤销！'
  );

  if (!confirmed) return;

  // 三次确认
  const secondConfirm = confirm(
    '⚠️ 最终确认\n\n所有密码数据将被永久删除，确定继续吗？'
  );

  if (!secondConfirm) return;

  try {
    await chrome.storage.local.clear();

    // 重新初始化默认设置
    await chrome.storage.local.set({
      vaultLocked: true,
      masterKeyHash: null,
      encryptedItems: [],
      settings: {
        autoLockMinutes: 15,
        syncEnabled: false,
        serverUrl: 'https://vaultkey.app/api',
        neverSaveDomains: []
      }
    });

    // 通知后台
    chrome.runtime.sendMessage({ type: 'LOCK_VAULT' });

    // 重置界面
    autoLockMinutes.value = 15;
    syncEnabled.checked = false;

    showToast('所有数据已清除');
  } catch (err) {
    console.error('清除数据失败:', err);
    showToast('清除失败', true);
  }
}

// ===== 工具函数 =====

/** 显示提示消息 */
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = isError ? 'toast error' : 'toast';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast hidden';
  }, 2500);
}
