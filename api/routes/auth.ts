/**
 * User Authentication API Routes
 * Handle user registration, login, token management
 */
import { Router, type Request, type Response } from 'express';

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

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: '缺少必要参数' });
    return;
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    res.status(409).json({ success: false, message: '该邮箱已被注册' });
    return;
  }

  const saltA = Math.random().toString(36).slice(2);
  const saltB = Math.random().toString(36).slice(2);
  const passwordHash = `${saltA}${password}${saltB}`;

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    passwordHash,
    saltA,
    saltB,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: '注册成功',
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

  const user = users.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ success: false, message: '邮箱或密码错误' });
    return;
  }

  const expectedHash = `${user.saltA}${password}${user.saltB}`;
  if (user.passwordHash !== expectedHash) {
    res.status(401).json({ success: false, message: '邮箱或密码错误' });
    return;
  }

  const token = `vaultkey-token-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: '登出成功' });
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ success: false, message: '未授权' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'mock@example.com',
      createdAt: new Date().toISOString(),
    },
  });
});

export default router;