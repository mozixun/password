/**
 * VaultKey 弹窗逻辑
 * 负责密码库的解锁、搜索、密码项展示和快捷操作
 */

// ===== DOM 元素引用 =====
const lockedView = document.getElementById('locked-view');
const unlockedView = document.getElementById('unlocked-view');
const unlockForm = document.getElementById('unlock-form');
const masterPasswordInput = document.getElementById('master-password');
const togglePasswordBtn = document.getElementById('toggle-password');
const unlockError = document.getElementById('unlock-error');
const searchInput = document.getElementById('search-input');
const itemList = document.getElementById('item-list');
const emptyState = document.getElementById('empty-state');
const btnLock = document.getElementById('btn-lock');
const btnGenerate = document.getElementById('btn-generate');
const btnAdd = document.getElementById('btn-add');
const generatorPanel = document.getElementById('generator-panel');
const btnCloseGenerator = document.getElementById('btn-close-generator');
const generatedPasswordInput = document.getElementById('generated-password');
const btnCopyPassword = document.getElementById('btn-copy-password');
const btnRegenerate = document.getElementById('btn-regenerate');
const passwordLengthSlider = document.getElementById('password-length');
const lengthValue = document.getElementById('length-value');
const optUppercase = document.getElementById('opt-uppercase');
const optLowercase = document.getElementById('opt-lowercase');
const optNumbers = document.getElementById('opt-numbers');
const optSymbols = document.getElementById('opt-symbols');
const btnOpenWebapp = document.getElementById('btn-open-webapp');
const toast = document.getElementById('toast');

// ===== 状态管理 =====
let currentItems = []; // 当前密码项缓存
let isLocked = true;   // 是否锁定

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // 检查密码库锁定状态
  const response = await sendMessage({ type: 'GET_VAULT_STATUS' });
  isLocked = response ? response.locked : true;

  if (isLocked) {
    showLockedView();
  } else {
    await showUnlockedView();
  }
  bindEvents();
}

// ===== 视图切换 =====

/** 显示锁定视图 */
function showLockedView() {
  lockedView.classList.add('active');
  unlockedView.classList.remove('active');
  masterPasswordInput.focus();
}

/** 显示解锁后视图 */
async function showUnlockedView() {
  lockedView.classList.remove('active');
  unlockedView.classList.add('active');
  isLocked = false;

  // 从后台加载密码项
  await loadItems();
  renderItems();
}

// ===== 事件绑定 =====

function bindEvents() {
  // 解锁表单提交
  unlockForm.addEventListener('submit', handleUnlock);

  // 显示/隐藏密码
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = masterPasswordInput.type === 'password';
    masterPasswordInput.type = isPassword ? 'text' : 'password';
  });

  // 搜索输入
  searchInput.addEventListener('input', handleSearch);

  // 锁定按钮
  btnLock.addEventListener('click', handleLock);

  // 生成密码按钮
  btnGenerate.addEventListener('click', () => {
    generatorPanel.classList.toggle('hidden');
    if (!generatorPanel.classList.contains('hidden')) {
      generatePassword();
    }
  });

  // 关闭生成器面板
  btnCloseGenerator.addEventListener('click', () => {
    generatorPanel.classList.add('hidden');
  });

  // 重新生成密码
  btnRegenerate.addEventListener('click', generatePassword);

  // 复制生成的密码
  btnCopyPassword.addEventListener('click', copyGeneratedPassword);

  // 密码长度滑块
  passwordLengthSlider.addEventListener('input', () => {
    lengthValue.textContent = passwordLengthSlider.value;
    generatePassword();
  });

  // 密码选项变更
  [optUppercase, optLowercase, optNumbers, optSymbols].forEach(opt => {
    opt.addEventListener('change', generatePassword);
  });

  // 添加项目按钮
  btnAdd.addEventListener('click', () => {
    // 打开网页端添加页面
    chrome.tabs.create({ url: 'https://vaultkey.app/vault/add' });
  });

  // 打开 Web 应用
  btnOpenWebapp.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://vaultkey.app' });
  });

  // 列表项点击事件委托
  itemList.addEventListener('click', handleItemClick);
}

// ===== 解锁处理 =====

async function handleUnlock(e) {
  e.preventDefault();
  const password = masterPasswordInput.value.trim();
  if (!password) return;

  // 禁用按钮防止重复提交
  const submitBtn = unlockForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '解锁中...';

  try {
    const response = await sendMessage({
      type: 'UNLOCK_VAULT',
      masterPassword: password
    });

    if (response && response.success) {
      unlockError.classList.add('hidden');
      masterPasswordInput.value = '';
      await showUnlockedView();
    } else {
      unlockError.classList.remove('hidden');
      masterPasswordInput.value = '';
      masterPasswordInput.focus();
    }
  } catch (err) {
    unlockError.textContent = '解锁失败，请重试';
    unlockError.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '解锁';
  }
}

// ===== 锁定处理 =====

function handleLock() {
  sendMessage({ type: 'LOCK_VAULT' });
  isLocked = true;
  currentItems = [];
  showLockedView();
}

// ===== 密码项加载 =====

async function loadItems() {
  try {
    const response = await sendMessage({ type: 'GET_ITEMS' });
    if (response && response.items) {
      currentItems = response.items;
    }
  } catch (err) {
    console.error('加载密码项失败:', err);
    currentItems = [];
  }
}

// ===== 搜索处理 =====

function handleSearch() {
  renderItems();
}

/** 根据搜索关键词过滤密码项 */
function filterItems() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return currentItems;

  return currentItems.filter(item => {
    const title = (item.title || '').toLowerCase();
    const username = (item.username || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    return title.includes(query) || username.includes(query) || url.includes(query);
  });
}

// ===== 渲染密码项列表 =====

function renderItems() {
  const items = filterItems();
  itemList.innerHTML = '';

  if (items.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  items.forEach(item => {
    const card = createItemCard(item);
    itemList.appendChild(card);
  });
}

/** 创建单个密码项卡片 */
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.id = item.id;

  // 图标 - 取标题首字母
  const initial = (item.title || '?')[0].toUpperCase();

  card.innerHTML = `
    <div class="item-icon">${initial}</div>
    <div class="item-info">
      <div class="item-title">${escapeHtml(item.title || '未命名')}</div>
      <div class="item-subtitle">${escapeHtml(item.username || '无用户名')}</div>
    </div>
    <div class="item-actions">
      <button class="item-action" data-action="fill" title="自动填充">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </button>
      <button class="item-action" data-action="copy" title="复制密码">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
    </div>
  `;

  return card;
}

// ===== 密码项操作处理 =====

function handleItemClick(e) {
  const actionBtn = e.target.closest('.item-action');
  const card = e.target.closest('.item-card');
  if (!card) return;

  const itemId = card.dataset.id;

  // 如果点击了操作按钮
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    if (action === 'fill') {
      fillCredentials(itemId);
    } else if (action === 'copy') {
      copyItemPassword(itemId);
    }
    return;
  }

  // 默认点击卡片：自动填充
  fillCredentials(itemId);
}

/** 自动填充凭据到当前标签页 */
async function fillCredentials(itemId) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_CREDENTIALS',
      itemId: itemId
    });

    showToast('已填充凭据');
  } catch (err) {
    console.error('填充凭据失败:', err);
    showToast('无法填充到此页面', true);
  }
}

/** 复制密码项密码 */
async function copyItemPassword(itemId) {
  try {
    const response = await sendMessage({
      type: 'GET_ITEM_PASSWORD',
      itemId: itemId
    });

    if (response && response.password) {
      await navigator.clipboard.writeText(response.password);
      showToast('密码已复制');
    }
  } catch (err) {
    console.error('复制密码失败:', err);
    showToast('复制失败', true);
  }
}

// ===== 密码生成器 =====

/** 生成随机密码 */
function generatePassword() {
  const length = parseInt(passwordLengthSlider.value, 10);
  const useUpper = optUppercase.checked;
  const useLower = optLowercase.checked;
  const useNumbers = optNumbers.checked;
  const useSymbols = optSymbols.checked;

  // 确保至少选中一种字符类型
  if (!useUpper && !useLower && !useNumbers && !useSymbols) {
    optLowercase.checked = true;
    return generatePassword();
  }

  let chars = '';
  let required = []; // 确保每种选中的类型至少出现一次

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

  // 先从每个必需类型中各取一个字符
  let password = '';
  for (const req of required) {
    password += req[Math.floor(Math.random() * req.length)];
  }

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // 打乱顺序
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  generatedPasswordInput.value = password;
}

/** 复制生成的密码 */
async function copyGeneratedPassword() {
  const password = generatedPasswordInput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    showToast('密码已复制');
  } catch (err) {
    // 回退方案
    generatedPasswordInput.select();
    document.execCommand('copy');
    showToast('密码已复制');
  }
}

// ===== 工具函数 =====

/** 向后台脚本发送消息 */
function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('消息发送错误:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

/** 显示提示消息 */
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.className = isError ? 'toast error' : 'toast';

  // 清除之前的定时器
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast hidden';
  }, 2000);
}

/** HTML 转义，防止 XSS */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
