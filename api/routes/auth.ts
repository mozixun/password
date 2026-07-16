/**
 * User Authentication API Routes
 * Handle user registration, login, token management with proper security
 */
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

interface User {
  id: string;
  email: string;
  passwordHash: string;
  saltA: string;
  saltB: string;
  createdAt: string;
}

const users: User[] = [];
const loginAttempts: Record<string, { attempts: number; lastAttempt: number }> = {};
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET || 'vaultkey-secure-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '1h';

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64');
}

async function hashPassword(password: string, saltA: string, saltB: string): Promise<string> {
  const combined = `${saltA}${password}${saltB}`;
  return bcrypt.hash(combined, 12);
}

async function verifyPassword(password: string, saltA: string, saltB: string, hash: string): Promise<boolean> {
  const combined = `${saltA}${password}${saltB}`;
  return bcrypt.compare(combined, hash);
}

function createJWT(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function checkRateLimit(email: string): { allowed: boolean; remaining: number } {
  const record = loginAttempts[email] || { attempts: 0, lastAttempt: 0 };
  
  if (Date.now() - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts[email] = { attempts: 0, lastAttempt: Date.now() };
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }
  
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - record.attempts };
}

function incrementLoginAttempt(email: string): void {
  const record = loginAttempts[email] || { attempts: 0, lastAttempt: 0 };
  loginAttempts[email] = {
    attempts: record.attempts + 1,
    lastAttempt: Date.now(),
  };
}

function resetLoginAttempt(email: string): void {
  delete loginAttempts[email];
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: '缺少必要参数' });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: '无效的邮箱格式' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ success: false, message: '密码长度至少为8个字符' });
    return;
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    res.status(409).json({ success: false, message: '该邮箱已被注册' });
    return;
  }

  const saltA = generateSalt();
  const saltB = generateSalt();
  const passwordHash = await hashPassword(password, saltA, saltB);

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    passwordHash,
    saltA,
    saltB,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  resetLoginAttempt(email);

  const token = createJWT(newUser.id, newUser.email);

  res.status(201).json({
    success: true,
    message: '注册成功',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
  });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: '缺少必要参数' });
    return;
  }

  const rateLimit = checkRateLimit(email);
  if (!rateLimit.allowed) {
    res.status(429).json({ 
      success: false, 
      message: `登录尝试次数过多，请15分钟后重试`,
      remaining: 0,
    });
    return;
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    incrementLoginAttempt(email);
    res.status(401).json({ 
      success: false, 
      message: '邮箱或密码错误',
      remaining: rateLimit.remaining - 1,
    });
    return;
  }

  const isValid = await verifyPassword(password, user.saltA, user.saltB, user.passwordHash);
  if (!isValid) {
    incrementLoginAttempt(email);
    res.status(401).json({ 
      success: false, 
      message: '邮箱或密码错误',
      remaining: rateLimit.remaining - 1,
    });
    return;
  }

  resetLoginAttempt(email);
  const token = createJWT(user.id, user.email);

  res.status(200).json({
    success: true,
    message: '登录成功',
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

export default router;
