/**
 * VaultKey 内容脚本
 * 负责检测登录表单、显示填充图标、凭据下拉框和保存提示
 */

// ===== 常量配置 =====
const VAULTKEY_ID = 'vaultkey-extension';         // 扩展标识前缀
const ICON_CLASS = 'vk-field-icon';               // 输入框图标类名
const DROPDOWN_CLASS = 'vk-dropdown';              // 下拉菜单类名
const NOTIFICATION_CLASS = 'vk-notification';      // 通知栏类名
const FIELD_WRAPPER_CLASS = 'vk-field-wrapper';    // 字段包装器类名

// ===== 状态管理 =====
let detectedForms = [];     // 检测到的登录表单
let activeDropdown = null;  // 当前显示的下拉菜单
let matchedCredentials = []; // 当前匹配的凭据

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', detectForms);

// 使用 MutationObserver 监听动态加载的表单
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldScan = true;
      break;
    }
  }
  if (shouldScan) {
    // 延迟扫描避免频繁触发
    clearTimeout(detectForms._timer);
    detectForms._timer = setTimeout(detectForms, 500);
  }
});

observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
});

// ===== 表单检测 =====

/**
 * 扫描页面中的登录/注册表单
 * 识别策略：
 * 1. 包含 password 输入框的表单
 * 2. 附近有 email/username 输入框
 * 3. 排除搜索表单
 */
function detectForms() {
  const passwordFields = document.querySelectorAll('input[type="password"]');

  passwordFields.forEach((passwordField) => {
    // 避免重复处理
    if (passwordField.dataset.vkProcessed) return;
    passwordField.dataset.vkProcessed = 'true';

    // 查找所属表单
    const form = passwordField.closest('form');

    // 查找用户名/邮箱字段
    const usernameField = findUsernameField(form, passwordField);

    // 包装字段并添加图标
    wrapField(passwordField, usernameField);

    // 监听表单提交（用于保存凭据）
    if (form) {
      form.addEventListener('submit', () => {
        handleFormSubmit(form, usernameField, passwordField);
      }, { capture: true });
    }

    detectedForms.push({
      form,
      usernameField,
      passwordField
    });
  });

  // 同时检测独立的用户名/邮箱字段（不在 form 内的情况）
  detectStandaloneFields();
}

/**
 * 查找用户名/邮箱输入框
 * 策略：在同一表单内查找 type=email, type=text 且 name/autocomplete 包含用户名相关关键词
 */
function findUsernameField(form, passwordField) {
  if (!form) return findNearestUsernameField(passwordField);

  // 优先查找 email 类型
  const emailField = form.querySelector('input[type="email"]');
  if (emailField) return emailField;

  // 查找 text 类型且带有用户名相关属性的字段
  const textFields = form.querySelectorAll('input[type="text"], input:not([type])');
  const usernameKeywords = ['user', 'email', 'login', 'account', 'name', 'username', 'account'];

  for (const field of textFields) {
    const attrs = [
      field.name || '',
      field.id || '',
      field.autocomplete || '',
      field.placeholder || ''
    ].join(' ').toLowerCase();

    if (usernameKeywords.some(kw => attrs.includes(kw))) {
      return field;
    }
  }

  // 回退：取密码字段前面的第一个 text 输入框
  if (form) {
    const allInputs = Array.from(form.querySelectorAll('input'));
    const pwdIndex = allInputs.indexOf(passwordField);
    for (let i = pwdIndex - 1; i >= 0; i--) {
      const input = allInputs[i];
      if (input.type === 'text' || input.type === 'email' || !input.type) {
        return input;
      }
    }
  }

  return null;
}

/** 在没有 form 的情况下，查找距离密码字段最近的用户名字段 */
function findNearestUsernameField(passwordField) {
  const parent = passwordField.parentElement;
  if (!parent) return null;

  const container = parent.parentElement || parent;
  const emailField = container.querySelector('input[type="email"]');
  if (emailField) return emailField;

  const textFields = container.querySelectorAll('input[type="text"], input:not([type])');
  return textFields.length > 0 ? textFields[0] : null;
}

/** 检测独立的登录字段（无 form 包裹） */
function detectStandaloneFields() {
  const emailFields = document.querySelectorAll('input[type="email"]');
  emailFields.forEach((field) => {
    if (field.dataset.vkProcessed) return;
    // 只处理附近有密码字段的情况
    const container = field.closest('div, section, main') || document.body;
    const nearbyPwd = container.querySelector('input[type="password"]');
    if (nearbyPwd && !nearbyPwd.dataset.vkProcessed) {
      nearbyPwd.dataset.vkProcessed = 'true';
      const usernameField = field;
      wrapField(nearbyPwd, usernameField);
      detectedForms.push({ form: null, usernameField, passwordField: nearbyPwd });
    }
  });
}

// ===== 字段包装与图标 =====

/**
 * 包装密码字段，添加 VaultKey 图标
 */
function wrapField(passwordField, usernameField) {
  // 确保父元素是 position: relative
  const parent = passwordField.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.classList.add(FIELD_WRAPPER_CLASS);
  }

  // 创建 VaultKey 图标按钮
  const icon = document.createElement('div');
  icon.className = ICON_CLASS;
  icon.title = 'VaultKey: 填充密码';
  icon.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `;

  // 图标点击：请求凭据并显示下拉菜单
  icon.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleIconClick(icon, passwordField, usernameField);
  });

  // 将图标插入密码字段后面
  passwordField.insertAdjacentElement('afterend', icon);

  // 也在用户名字段上添加焦点监听
  if (usernameField) {
    usernameField.addEventListener('focus', () => {
      requestCredentialsForPage(passwordField, usernameField);
    }, { once: true });
  }
}

// ===== 图标点击处理 =====

async function handleIconClick(icon, passwordField, usernameField) {
  // 如果下拉菜单已显示，则关闭
  if (activeDropdown) {
    closeDropdown();
    return;
  }

  // 从后台获取当前页面的凭据
  const credentials = await requestCredentialsForPage(passwordField, usernameField);

  if (!credentials || credentials.length === 0) {
    showMiniNotification('未找到匹配的凭据');
    return;
  }

  // 显示凭据选择下拉菜单
  showDropdown(icon, credentials, passwordField, usernameField);
}

/** 向后台请求当前页面的匹配凭据 */
async function requestCredentialsForPage(passwordField, usernameField) {
  try {
    const url = window.location.href;
    const response = await chrome.runtime.sendMessage({
      type: 'GET_CREDENTIALS_FOR_URL',
      url: url
    });

    if (response && response.credentials) {
      matchedCredentials = response.credentials;
      return response.credentials;
    }
  } catch (err) {
    console.warn('VaultKey: 获取凭据失败', err);
  }
  return [];
}

// ===== 下拉菜单 =====

/**
 * 显示凭据选择下拉菜单
 */
function showDropdown(anchor, credentials, passwordField, usernameField) {
  closeDropdown(); // 先关闭已有的

  const dropdown = document.createElement('div');
  dropdown.className = DROPDOWN_CLASS;

  // 标题
  const header = document.createElement('div');
  header.className = 'vk-dropdown-header';
  header.textContent = 'VaultKey 密码库';
  dropdown.appendChild(header);

  // 凭据列表
  credentials.forEach((cred) => {
    const item = document.createElement('div');
    item.className = 'vk-dropdown-item';
    item.innerHTML = `
      <div class="vk-dropdown-item-title">${escapeHtml(cred.title || '未命名')}</div>
      <div class="vk-dropdown-item-subtitle">${escapeHtml(cred.username || '')}</div>
    `;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fillFormFields(usernameField, passwordField, cred.username, cred.password);
      closeDropdown();
    });
    dropdown.appendChild(item);
  });

  // 如果没有凭据
  if (credentials.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'vk-dropdown-empty';
    empty.textContent = '未找到匹配的登录信息';
    dropdown.appendChild(empty);
  }

  // 定位下拉菜单
  const rect = anchor.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
  dropdown.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(dropdown);
  activeDropdown = dropdown;

  // 点击外部关闭
  setTimeout(() => {
    document.addEventListener('click', closeDropdown, { once: true });
  }, 10);
}

/** 关闭下拉菜单 */
function closeDropdown() {
  if (activeDropdown) {
    activeDropdown.remove();
    activeDropdown = null;
  }
}

// ===== 表单填充 =====

/**
 * 填充用户名和密码到表单字段
 * 使用模拟用户输入的方式，兼容 React/Vue 等框架
 */
function fillFormFields(usernameField, passwordField, username, password) {
  // 填充用户名
  if (usernameField && username) {
    fillFieldValue(usernameField, username);
  }

  // 填充密码
  if (passwordField && password) {
    fillFieldValue(passwordField, password);
  }

  // 高亮动画
  highlightFields(usernameField, passwordField);
}

/**
 * 安全地设置输入框的值，兼容各种前端框架
 * 通过模拟原生输入事件确保框架能检测到值变化
 */
function fillFieldValue(field, value) {
  // 聚焦字段
  field.focus();

  // 使用 nativeInputValueSetter 绕过 React 的受控组件
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(field, value);
  } else {
    field.value = value;
  }

  // 触发各种事件确保框架检测到变化
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

  // 失去焦点
  field.blur();
}

/** 高亮已填充的字段 */
function highlightFields(usernameField, passwordField) {
  [usernameField, passwordField].forEach((field) => {
    if (!field) return;

    field.classList.add('vk-field-highlight');

    setTimeout(() => {
      field.classList.remove('vk-field-highlight');
    }, 1500);
  });
}

// ===== 表单提交 - 保存凭据 =====

/**
 * 当用户提交登录表单时，检测是否需要保存凭据
 */
function handleFormSubmit(form, usernameField, passwordField) {
  const username = usernameField ? usernameField.value : '';
  const password = passwordField ? passwordField.value : '';

  // 忽略空值
  if (!password || password.length < 1) return;

  // 发送到后台，让后台判断是否需要提示保存
  chrome.runtime.sendMessage({
    type: 'CHECK_SAVE_CREDENTIALS',
    url: window.location.href,
    username: username,
    password: password
  });
}

// ===== 保存凭据通知栏 =====

/**
 * 显示保存凭据的通知栏（由后台脚本触发）
 */
function showSaveNotification(username) {
  // 移除已有通知
  const existing = document.querySelector(`.${NOTIFICATION_CLASS}`);
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = NOTIFICATION_CLASS;
  notification.innerHTML = `
    <div class="vk-notification-content">
      <div class="vk-notification-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="vk-notification-text">
        <strong>VaultKey</strong> - 是否保存此登录信息？<br>
        <span class="vk-notification-username">${escapeHtml(username)}</span>
      </div>
      <div class="vk-notification-actions">
        <button class="vk-btn-save" data-action="save">保存</button>
        <button class="vk-btn-later" data-action="later">以后再说</button>
        <button class="vk-btn-never" data-action="never">永不</button>
      </div>
    </div>
  `;

  // 绑定按钮事件
  notification.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === 'save') {
      chrome.runtime.sendMessage({ type: 'SAVE_CREDENTIALS_CONFIRM' });
    } else if (action === 'never') {
      chrome.runtime.sendMessage({ type: 'SAVE_CREDENTIALS_NEVER' });
    }
    notification.classList.add('vk-notification-exit');
    setTimeout(() => notification.remove(), 300);
  });

  document.body.appendChild(notification);
}

// ===== 迷你通知 =====

function showMiniNotification(text) {
  let el = document.createElement('div');
  el.className = 'vk-mini-notification';
  el.textContent = text;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add('vk-mini-notification-exit');
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

// ===== 消息监听 =====

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'FILL_CREDENTIALS':
      // 从弹窗触发的自动填充
      if (message.username && message.password) {
        const pwdField = document.querySelector('input[type="password"]');
        const usrField = findUsernameField(pwdField?.closest('form'), pwdField);
        fillFormFields(usrField, pwdField, message.username, message.password);
        sendResponse({ success: true });
      } else if (message.itemId) {
        // 通过 itemId 从后台获取凭据
        chrome.runtime.sendMessage({
          type: 'GET_ITEM_PASSWORD',
          itemId: message.itemId
        }, (response) => {
          if (response && response.password) {
            const pwdField = document.querySelector('input[type="password"]');
            const usrField = findUsernameField(pwdField?.closest('form'), pwdField);
            fillFormFields(usrField, pwdField, response.username, response.password);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false });
          }
        });
        return true; // 异步响应
      }
      break;

    case 'SHOW_SAVE_NOTIFICATION':
      showSaveNotification(message.username || '');
      sendResponse({ success: true });
      break;

    case 'DETECT_FORMS':
      detectForms();
      sendResponse({ forms: detectedForms.length });
      break;

    case 'GET_DETECTED_FORMS':
      sendResponse({
        forms: detectedForms.map(f => ({
          hasUsername: !!f.usernameField,
          hasPassword: !!f.passwordField
        }))
      });
      break;
  }

  return false;
});

// ===== 工具函数 =====

/** HTML 转义 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
