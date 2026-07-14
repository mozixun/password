# 开发指南

## 项目结构

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
│   ├── routes/             # 路由定义
│   ├── app.ts              # Express 应用配置
│   └── server.ts           # 服务器入口
├── extension/              # 浏览器插件
│   ├── background.js       # 后台服务工作者
│   ├── content.js          # 内容脚本
│   ├── popup.js            # 弹窗脚本
│   ├── content.css         # 内容样式
│   ├── popup.css           # 弹窗样式
│   └── manifest.json       # 扩展配置
├── ios/                    # iPhone 应用
├── mac/                    # Mac 应用
├── public/                 # 静态资源
├── .github/workflows/      # GitHub Actions 工作流
├── .env                    # 环境变量
├── package.json            # 依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind CSS 配置
└── postcss.config.js       # PostCSS 配置
```

## 开发流程

### 分支策略

- `main`：主分支，生产环境代码
- `develop`：开发分支，所有功能开发完成后合并到此分支
- `feature/*`：功能分支，开发新功能时创建
- `bugfix/*`：修复分支，修复 bug 时创建

### 提交规范

```
<类型>(<范围>): <描述>

<详细说明>
```

类型：
- `feat`：新功能
- `fix`：修复 bug
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：重构
- `test`：测试
- `chore`：构建/工具

### 代码审查

所有 PR 必须经过至少一个人的代码审查才能合并到 `develop` 分支。

## 技术栈详情

### 前端

- **React 18**：UI 框架
- **TypeScript**：类型安全
- **Vite**：构建工具，支持快速热更新
- **Tailwind CSS 3**：原子化 CSS
- **Zustand**：轻量级状态管理
- **React Router v7**：路由管理
- **Lucide React**：图标库

### 后端

- **Node.js 20**：运行时
- **Express 4**：Web 框架
- **TypeScript**：类型安全
- **PostgreSQL**：数据库
- **Redis**：缓存

### 加密

- **Web Crypto API**：浏览器原生加密
- **AES-256-GCM**：数据加密
- **PBKDF2**：密钥派生（700000次迭代）
- **HKDF**：密钥派生（用于派生保管库密钥）
- **SHA-256**：哈希函数

## 构建与测试

### 构建

```bash
# 开发构建
pnpm run build

# 生产构建
pnpm run build
```

### 测试

```bash
# 运行单元测试
pnpm run test

# 运行 ESLint
pnpm run lint

# 类型检查
pnpm run check
```

## 调试

### 浏览器调试

使用 Chrome DevTools：
1. 打开开发者工具 (`F12`)
2. 切换到"Sources"标签
3. 在 `src/` 目录下找到对应的文件
4. 设置断点进行调试

### React DevTools

安装 React DevTools 扩展：
1. 在 Chrome 网上应用店搜索"React Developer Tools"
2. 安装扩展
3. 在开发者工具中切换到"Components"或"Profiler"标签

## 部署

### GitHub Pages

项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次推送到 `main` 分支时，自动执行构建和部署。

部署地址：`https://your-username.github.io/vaultkey/`

### Vercel

项目已配置 Vercel 部署。推送代码后自动部署。

部署地址：`https://vaultkey.vercel.app/`

### Docker

```bash
# 构建镜像
docker build -t vaultkey .

# 运行容器
docker run -p 5173:5173 vaultkey
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m "feat(scope): description"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 许可证

MIT License