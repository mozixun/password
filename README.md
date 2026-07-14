# VaultKey 密码管理器

[![GitHub Pages Deploy](https://github.com/your-username/vaultkey/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/vaultkey/actions/workflows/deploy.yml)

VaultKey 是一款全平台密码管理器，对标 1Password，为用户提供安全、便捷的密码和敏感信息管理解决方案。

## ✨ 功能特性

- **端到端加密**：采用 AES-256-GCM 加密算法，所有数据在客户端加密后上传
- **安全远程密码协议 (SRP)**：保护用户主密码，服务器永远不会知道原始密码
- **多平台支持**：Web、浏览器插件、iPhone、Mac
- **密码生成器**：可配置的安全密码生成
- **安全中心 (Watchtower)**：密码泄露监控、弱密码检测、重复密码识别
- **自动填充**：浏览器插件和系统级自动填充支持
- **多保管库**：支持个人和共享保管库
- **响应式设计**：完美适配桌面端、平板和移动端

## 🚀 快速开始

### 前置要求

- Node.js 20+
- pnpm 或 npm
- Git

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

开发服务器将在 `http://localhost:5173` 启动，API 服务将在 `http://localhost:3001` 启动。

### 构建生产版本

```bash
pnpm run build
```

构建产物将输出到 `dist` 目录。

## 📁 项目结构

```
vaultkey/
├── src/                    # Web 前端源码
│   ├── components/         # 可复用组件
│   ├── hooks/              # 自定义 Hooks
│   ├── i18n/               # 国际化
│   ├── lib/                # 工具函数
│   ├── pages/              # 页面组件
│   ├── store/              # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数（加密、自动填充等）
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── api/                    # 后端 API
├── extension/              # 浏览器插件
├── ios/                    # iPhone 应用
├── mac/                    # Mac 应用
├── public/                 # 静态资源
└── .github/workflows/      # GitHub Actions 工作流
```

## 🛠️ 技术栈

### 前端

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS 3** - 原子化 CSS
- **Zustand** - 状态管理
- **React Router v7** - 路由管理
- **Lucide React** - 图标库

### 后端

- **Node.js 20** - 运行时
- **Express 4** - Web 框架
- **TypeScript** - 类型安全

### 加密

- **Web Crypto API** - 浏览器原生加密
- **AES-256-GCM** - 数据加密
- **PBKDF2** - 密钥派生
- **HKDF** - 密钥派生
- **SHA-256** - 哈希函数

## 🔧 可用脚本

```bash
pnpm run client:dev    # 启动前端开发服务器
pnpm run server:dev    # 启动后端开发服务器
pnpm run dev           # 同时启动前后端开发服务器
pnpm run build         # 构建生产版本
pnpm run lint          # 运行 ESLint 检查
pnpm run check         # TypeScript 类型检查
pnpm run preview       # 预览构建产物
```

## 📖 文档

- [安装指南](https://github.com/your-username/vaultkey/wiki/Installation)
- [使用指南](https://github.com/your-username/vaultkey/wiki/Usage)
- [开发指南](https://github.com/your-username/vaultkey/wiki/Development)
- [API 文档](https://github.com/your-username/vaultkey/wiki/API)
- [安全文档](https://github.com/your-username/vaultkey/wiki/Security)

## 🤝 贡献

欢迎贡献代码！请阅读 [开发指南](https://github.com/your-username/vaultkey/wiki/Development) 了解贡献流程。

## 📄 许可证

MIT License