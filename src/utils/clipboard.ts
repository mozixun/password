/**
 * 剪贴板管理工具 - 支持自动清零
 * 所有复制操作通过此工具进行，以实现统一的剪贴板安全策略
 */

let clearTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 获取当前剪贴板自动清零时间（秒）
 * 从 localStorage 读取设置，默认 30 秒
 */
function getClipboardClearSeconds(): number {
  try {
    const settings = localStorage.getItem('vaultkey-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.clipboardClearSeconds ?? 30;
    }
  } catch {
    // 忽略解析错误
  }
  return 30;
}

/**
 * 将设置持久化到 localStorage，供剪贴板工具读取
 */
export function persistClipboardSettings(seconds: number): void {
  try {
    const existing = localStorage.getItem('vaultkey-settings');
    const parsed = existing ? JSON.parse(existing) : {};
    parsed.clipboardClearSeconds = seconds;
    localStorage.setItem('vaultkey-settings', JSON.stringify(parsed));
  } catch {
    // 忽略存储错误
  }
}

/**
 * 安全复制到剪贴板，支持自动清零
 * @param value 要复制的文本
 * @param customClearSeconds 自定义清零时间（秒），0 表示不清零
 */
export async function secureCopy(
  value: string,
  customClearSeconds?: number
): Promise<boolean> {
  // 取消之前的清零定时器
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }

  try {
    await navigator.clipboard.writeText(value);

    const clearSeconds = customClearSeconds ?? getClipboardClearSeconds();

    // 如果设置了大0秒，设置自动清零定时器
    if (clearSeconds > 0) {
      clearTimer = setTimeout(() => {
          // 尝试清除剪贴板（写入空字符串）
          navigator.clipboard
            .writeText('')
            .catch(() => {
              // 某些浏览器可能不允许在后台清除剪贴板，忽略错误
            });
          clearTimer = null;
        }, clearSeconds * 1000);
    }

    return true;
  } catch {
    // 降级处理
    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      const clearSeconds = customClearSeconds ?? getClipboardClearSeconds();
      if (clearSeconds > 0) {
        clearTimer = setTimeout(() => {
          const ta = document.createElement('textarea');
          ta.value = '';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          clearTimer = null;
        }, clearSeconds * 1000);
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 立即清除剪贴板内容
 */
export async function clearClipboard(): Promise<void> {
  if (clearTimer) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  try {
    await navigator.clipboard.writeText('');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = '';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
