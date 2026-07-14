# VaultKey 密码管理器

VaultKey 是一款全平台密码管理器，对标 1Password，为用户提供安全、便捷的密码和敏感信息管理解决方案。支持网页端、iPhone、Mac 和浏览器插件，实现跨设备无缝同步。

## 功能特性

- **端到端加密**：采用 AES-256-GCM 加密算法，所有数据在客户端加密后上传
- **安全远程密码协议 (SRP)**：保护用户主密码，服务器永远不会知道原始密码
- **多平台支持**：Web、浏览器插件、iPhone、Mac
- **密码生成器**：可配置的安全密码生成
- **安全中心 (Watchtower)**：密码泄露监控、弱密码检测、重复密码识别
- **自动填充**：浏览器插件和系统级自动填充支持
- **多保管库**：支持个人和共享保管库

## 快速开始

1. [安装指南](Installation.md)
2. [使用指南](Usage.md)
3. [开发指南](Development.md)

## 项目结构

```
vaultkey/
├── src/          # Web 前端源码
├── api/          # 后端 API
├── extension/    # 浏览器插件
├── ios/          # iPhone 应用
├── mac/          # Mac 应用
└── docs/         # 文档
```

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**：Zustand
- **路由**：React Router v7
- **后端**：Node.js + Express
- **加密**：Web Crypto API (AES-256-GCM, PBKDF2, HKDF)

## 许可证

MIT License