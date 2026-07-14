# 开发指南

## 项目结构

```
vaultkey/
├── src/                    # Web 前端源码
│   ├── components/         # 可复用组件
│   │   ├── AppLayout.tsx   # 应用布局组件
│   │   ├── ContextMenu.tsx # 右键菜单组件
│   │   ├── CopyButton.tsx  # 复制按钮组件
│   │   ├── Empty.tsx       # 空状态组件
│   │   ├── ItemCard.tsx    # 项目卡片组件
│   │   ├── PasswordDisplay.tsx # 密码显示组件
│   │   ├── SecurityScore.tsx   # 安全评分组件
│   │   └── Sidebar.tsx     # 侧边栏组件
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useTheme.ts     # 主题切换 Hook
│   │   └── useTranslation.ts # 国际化 Hook
│   ├── i18n/               # 国际化
│   │   ├── locales/        # 语言包
│   │   │   ├── en.ts       # 英语
│   │   │   └── zh.ts       # 中文
│   │   └── index.ts        # 国际化配置
│   ├── lib/                # 工具函数
│   │   └── utils.ts        # 通用工具函数
│   ├── pages/              # 页面组件
│   │   ├── AdminSettings.tsx   # 管理员设置页面
│   │   ├── Authenticator.tsx   # TOTP验证器页面
│   │   ├── Dashboard.tsx       # 仪表盘页面
│   │   ├── Generator.tsx       # 密码生成器页面
│   │   ├── Home.tsx            # 首页
│   │   ├── ItemDetail.tsx      # 项目详情页面
│   │   ├── Items.tsx           # 项目列表页面
│   │   ├── Login.tsx           # 登录页面
│   │   ├── Profile.tsx         # 用户资料页面
│   │   ├── Settings.tsx        # 设置页面
│   │   ├── Unlock.tsx          # 解锁页面
│   │   ├── Vaults.tsx          # 保管库页面
│   │   └── Watchtower.tsx      # 安全中心页面
│   ├── store/              # Zustand 状态管理
│   │   └── index.ts        # 全局状态管理
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 类型定义
│   ├── utils/              # 工具函数（加密、自动填充等）
│   │   ├── autofill.ts     # 自动填充工具
│   │   ├── breachDetection.ts # 数据泄露检测
│   │   ├── clipboard.ts    # 剪贴板管理
│   │   ├── crypto.ts       # 加密工具函数
│   │   ├── importExport.ts # 导入导出工具
│   │   ├── passkey.ts      # 通行密钥管理
│   │   └── totp.ts         # TOTP 验证码生成
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── api/                    # 后端 API
│   ├── routes/             # 路由定义
│   │   └── auth.ts         # 认证路由
│   ├── app.ts              # Express 应用配置
│   └── server.ts           # 服务器入口
├── extension/              # 浏览器插件
│   ├── icons/              # 图标文件
│   ├── background.js       # 后台服务工作者
│   ├── content.js          # 内容脚本
│   ├── popup.js            # 弹窗脚本
│   ├── content.css         # 内容样式
│   ├── popup.css           # 弹窗样式
│   ├── popup.html          # 弹窗 HTML
│   ├── options.html        # 选项页面
│   ├── options.js          # 选项脚本
│   └── manifest.json       # 扩展配置
├── ios/                    # iPhone 应用
│   └── VaultKey/           # iOS 应用源码
├── mac/                    # Mac 应用
│   └── VaultKey/           # Mac 应用源码
├── public/                 # 静态资源
├── .github/workflows/      # GitHub Actions 工作流
│   └── deploy.yml          # GitHub Pages 部署工作流
├── .env                    # 环境变量
├── package.json            # 依赖配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── postcss.config.js       # PostCSS 配置
└── eslint.config.js        # ESLint 配置
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

- **React 18**：UI 框架，使用函数组件和 Hooks
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

### 状态管理

使用 Zustand 进行全局状态管理，分为以下切片：
- `auth`：认证状态（登录、注册、解锁、自动锁定）
- `vaults`：保管库状态
- `folders`：文件夹状态
- `items`：项目状态
- `watchtower`：安全中心状态
- `generator`：密码生成器状态
- `ui`：UI 状态
- `settings`：设置状态
- `profile`：用户资料状态
- `admin`：管理员状态

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

### 状态调试

使用 Zustand DevTools：
1. 安装 `zustand/middleware`
2. 在 store 中启用 devtools 中间件
3. 在 Chrome 开发者工具中查看状态变化

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

## 代码约定

### TypeScript

- 使用严格模式 (`strict: true`)
- 使用 `type` 而非 `interface` 定义类型
- 使用 `unknown` 而非 `any`
- 为所有函数和变量添加类型注解

### React

- 使用函数组件和 Hooks
- 使用 `useCallback` 和 `useMemo` 优化性能
- 使用 `React.memo` 减少不必要的重渲染
- Hooks 必须在组件顶层调用

### 样式

- 使用 Tailwind CSS 原子化类名
- 避免使用 `!important`
- 使用自定义颜色变量 (`vault-*`)

### 命名规范

- 文件：小写蛇形命名 (`item-card.tsx`)
- 组件：帕斯卡命名 (`ItemCard`)
- 函数：小写驼峰命名 (`handleClick`)
- 变量：小写驼峰命名 (`userName`)
- 常量：大写蛇形命名 (`MAX_ATTEMPTS`)

### 错误处理

- 使用 `try/catch` 捕获异步错误
- 为用户提供清晰的错误提示
- 避免使用 `alert()` 显示错误

### 安全

- 不要记录敏感信息
- 使用 Web Crypto API 进行加密操作
- 不要在 localStorage 中存储明文密码
- 定期清除剪贴板中的敏感数据