const CRYPTO_VERSION = 1;
const PBKDF2_ITERATIONS = 700000;
const PBKDF2_KEY_LENGTH = 32;
const HKDF_KEY_LENGTH = 32;
const AES_IV_LENGTH = 12;
const AES_TAG_LENGTH = 16;
const SECURE_KEY_LENGTH = 16;
const RSA_KEY_SIZE = 2048;

export function getRandomValues<T extends Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array>(arr: T): T {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(arr);
  }
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(Math.random() * 0x100000000) as T[number];
  }
  return arr;
}

export interface EncryptedData {
  version: number;
  iv: string;
  tag: string;
  ciphertext: string;
}

export interface SecureKey {
  raw: Uint8Array;
  base32: string;
}

export interface VaultKey {
  rootKey: Uint8Array;
  srpKey: Uint8Array;
}

export interface DeviceKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyPem: string;
}

export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function bytesToBase32(bytes: Uint8Array): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      bits -= 5;
      result += BASE32_ALPHABET[(value >>> bits) & 0x1F];
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1F];
  }

  return result;
}

function base32ToBytes(base32: string): Uint8Array {
  base32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  const bytes = new Uint8Array(Math.floor((base32.length * 5) / 8));
  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < base32.length; i++) {
    const char = base32[i];
    const charIndex = BASE32_ALPHABET.indexOf(char);
    
    if (charIndex === -1) continue;
    
    value = (value << 5) | charIndex;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes[index++] = (value >>> bits) & 0xFF;
    }
  }

  return bytes.slice(0, index);
}

export function generateSecureKey(): SecureKey {
  const raw = new Uint8Array(SECURE_KEY_LENGTH);
  getRandomValues(raw);
  return {
    raw,
    base32: bytesToBase32(raw),
  };
}

export function parseSecureKey(base32: string): SecureKey {
  const raw = base32ToBytes(base32);
  if (raw.length !== SECURE_KEY_LENGTH) {
    throw new Error('Invalid secure key length');
  }
  return { raw, base32 };
}

export async function generateSaltA(email: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const input = encoder.encode(email.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', input);
  return new Uint8Array(hash);
}

export async function generateSaltB(): Promise<Uint8Array> {
  const salt = new Uint8Array(16);
  getRandomValues(salt);
  return salt;
}

export async function deriveK1(
  masterPassword: string,
  saltA: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltA,
      iterations: PBKDF2_ITERATIONS,
    },
    passwordKey,
    PBKDF2_KEY_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
}

export async function deriveVaultKey(
  k1: Uint8Array,
  secureKey: Uint8Array,
  saltB: Uint8Array
): Promise<VaultKey> {
  const combined = new Uint8Array(k1.length + secureKey.length);
  combined.set(k1, 0);
  combined.set(secureKey, k1.length);

  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    combined,
    'HKDF',
    false,
    ['deriveKey', 'deriveBits']
  );

  const rootKeyBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltB,
      info: new TextEncoder().encode('vaultkey-root-key'),
    },
    hkdfKey,
    HKDF_KEY_LENGTH * 8
  );

  const srpKeyBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltB,
      info: new TextEncoder().encode('vaultkey-srp-key'),
    },
    hkdfKey,
    HKDF_KEY_LENGTH * 8
  );

  return {
    rootKey: new Uint8Array(rootKeyBits),
    srpKey: new Uint8Array(srpKeyBits),
  };
}

export async function encryptAESGCM(
  plaintext: string,
  key: Uint8Array
): Promise<EncryptedData> {
  const iv = new Uint8Array(AES_IV_LENGTH);
  getRandomValues(iv);

  const aesKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: AES_TAG_LENGTH * 8 },
    aesKey,
    encoder.encode(plaintext)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const tag = encryptedArray.slice(-AES_TAG_LENGTH);
  const ciphertext = encryptedArray.slice(0, -AES_TAG_LENGTH);

  return {
    version: CRYPTO_VERSION,
    iv: bytesToBase64(iv),
    tag: bytesToBase64(tag),
    ciphertext: bytesToBase64(ciphertext),
  };
}

export async function decryptAESGCM(
  data: EncryptedData,
  key: Uint8Array
): Promise<string> {
  if (data.version !== CRYPTO_VERSION) {
    throw new Error('Unsupported encryption version');
  }

  const iv = base64ToBytes(data.iv);
  const tag = base64ToBytes(data.tag);
  const ciphertext = base64ToBytes(data.ciphertext);

  if (iv.length !== AES_IV_LENGTH) {
    throw new Error('Invalid IV length');
  }

  if (tag.length !== AES_TAG_LENGTH) {
    throw new Error('Invalid tag length');
  }

  const aesKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const encryptedWithTag = new Uint8Array(ciphertext.length + tag.length);
  encryptedWithTag.set(ciphertext, 0);
  encryptedWithTag.set(tag, ciphertext.length);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: AES_TAG_LENGTH * 8 },
      aesKey,
      encryptedWithTag
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    throw new Error('Decryption failed: invalid key or tampered data');
  }
}

export async function generateRSAKeyPair(): Promise<DeviceKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: RSA_KEY_SIZE,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyPem = await exportPublicKeyToPem(keyPair.publicKey);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyPem,
  };
}

export async function exportPublicKeyToPem(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const exportedArray = new Uint8Array(exported);
  const base64 = bytesToBase64(exportedArray);
  return `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n') || base64}\n-----END PUBLIC KEY-----`;
}

export async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  
  const bytes = base64ToBytes(base64);
  return crypto.subtle.importKey(
    'spki',
    bytes,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

export async function encryptWithRSA(
  data: Uint8Array,
  publicKey: CryptoKey
): Promise<string> {
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  return bytesToBase64(new Uint8Array(encrypted));
}

export async function decryptWithRSA(
  encryptedBase64: string,
  privateKey: CryptoKey
): Promise<Uint8Array> {
  const encrypted = base64ToBytes(encryptedBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encrypted as BufferSource
  );
  return new Uint8Array(decrypted);
}

export async function hashSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return bytesToHex(new Uint8Array(hash));
}

export function generateRecoveryCode(): string {
  const code = new Uint8Array(16);
  getRandomValues(code);
  const hex = bytesToHex(code);
  return hex.match(/.{1,4}/g)?.join('-') || hex;
}

export function generateDeviceId(): string {
  const bytes = new Uint8Array(16);
  getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function verifyPassword(
  inputPassword: string,
  storedSaltA: Uint8Array,
  storedK1Hash: string
): Promise<boolean> {
  const k1 = await deriveK1(inputPassword, storedSaltA);
  const k1Hash = await hashSHA256(bytesToHex(k1));
  return k1Hash === storedK1Hash;
}