// VaultKey 密码管理器 - TOTP 验证码生成器
import type { TOTPConfig } from '@/types';

/**
 * Base32 解码
 */
function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanStr = str.replace(/[^A-Z2-7]/gi, '').toUpperCase();
  
  const output: number[] = [];
  let buffer = 0;
  let bits = 0;
  
  for (const char of cleanStr) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    
    buffer = (buffer << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      output.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  
  return new Uint8Array(output);
}

/**
 * 使用 HMAC 生成 TOTP 验证码
 */
async function hmacSha(secret: Uint8Array, message: Uint8Array, algorithm: string): Promise<Uint8Array> {
  const algoMap: Record<string, string> = {
    'SHA1': 'SHA-1',
    'SHA256': 'SHA-256',
    'SHA512': 'SHA-512',
  };
  
  const cryptoAlgo = algoMap[algorithm] || 'SHA-1';
  
  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: cryptoAlgo },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, message);
  return new Uint8Array(signature);
}

/**
 * 从 HMAC 结果提取动态截断码
 */
function dynamicTruncateCode(hmacResult: Uint8Array, digits: number): string {
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code = (
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  );
  
  return (code % Math.pow(10, digits)).toString().padStart(digits, '0');
}

/**
 * 生成当前 TOTP 验证码
 * @param config TOTP 配置
 * @returns 6位或8位验证码
 */
export async function generateTOTP(config: TOTPConfig): Promise<string> {
  const secret = base32Decode(config.secret);
  const timeCounter = Math.floor(Date.now() / 1000 / config.period);
  
  // 将时间计数器转换为 8 字节大端序
  const message = new Uint8Array(8);
  let counter = timeCounter;
  for (let i = 7; i >= 0; i--) {
    message[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  
  const hmacResult = await hmacSha(secret, message, config.algorithm);
  return dynamicTruncateCode(hmacResult, config.digits);
}

/**
 * 计算剩余有效秒数
 * @param period 周期秒数 (通常为 30)
 * @returns 剩余秒数 (0 - period)
 */
export function getRemainingSeconds(period: number = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}

/**
 * 计算进度百分比 (用于进度条)
 * @param period 周期秒数
 * @returns 0-100 的百分比
 */
export function getProgressPercentage(period: number = 30): number {
  const remaining = getRemainingSeconds(period);
  return ((period - remaining) / period) * 100;
}

/**
 * 解析 OTP URI (otpauth://totp/...)
 * @param uri OTP URI
 * @returns TOTPConfig 配置对象
 */
export function parseOTPUri(uri: string): TOTPConfig | null {
  try {
    if (!uri.startsWith('otpauth://totp/')) return null;
    
    const url = new URL(uri);
    const params = url.searchParams;
    
    const label = decodeURIComponent(url.pathname.slice(6)); // 移除 '/totp/'
    const [issuerFromLabel, account] = label.includes(':') 
      ? label.split(':') 
      : [params.get('issuer') || '', label];
    
    return {
      secret: params.get('secret') || '',
      algorithm: (params.get('algorithm') as 'SHA1' | 'SHA256' | 'SHA512') || 'SHA1',
      digits: parseInt(params.get('digits') || '6', 10),
      period: parseInt(params.get('period') || '30', 10),
      issuer: params.get('issuer') || issuerFromLabel,
      account: account || params.get('account') || '',
    };
  } catch {
    return null;
  }
}

/**
 * 生成 OTP URI
 * @param config TOTP 配置
 * @param title 标题 (可选)
 * @returns otpauth:// URI
 */
export function generateOTPUri(config: TOTPConfig, title?: string): string {
  const issuer = config.issuer || 'VaultKey';
  const account = config.account || title || 'Account';
  const label = encodeURIComponent(`${issuer}:${account}`);
  
  const params = new URLSearchParams({
    secret: config.secret,
    algorithm: config.algorithm,
    digits: config.digits.toString(),
    period: config.period.toString(),
    issuer: issuer,
  });
  
  return `otpauth://totp/${label}?${params.toString()}`;
}