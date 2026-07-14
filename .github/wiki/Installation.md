# 安装指南

## 前置要求

- Node.js 20+
- npm 或 pnpm
- Git

## Web 端开发环境

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/vaultkey.git
cd vaultkey
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

开发服务器将在 `http://localhost:5173` 启动，API 服务将在 `http://localhost:3001` 启动。

### 4. 构建生产版本

```bash
pnpm run build
```

构建产物将输出到 `dist` 目录。

## 浏览器插件

### Chrome 安装

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension/` 目录

### Firefox 安装

1. 打开 Firefox 浏览器
2. 访问 `about:debugging#/runtime/this-firefox`
3. 点击"临时载入附加组件"
4. 选择 `extension/manifest.json`

## iPhone 应用

### 开发环境

1. 安装 Xcode 15+
2. 打开 `ios/VaultKey/VaultKey.xcodeproj`
3. 选择目标设备或模拟器
4. 点击"运行"按钮

### 构建发布版本

```bash
cd ios
xcodebuild -scheme VaultKey -configuration Release build
```

## Mac 应用

### 开发环境

1. 安装 Xcode 15+
2. 打开 `mac/VaultKey/VaultKey.xcodeproj`
3. 选择目标设备或模拟器
4. 点击"运行"按钮

### 构建发布版本

```bash
cd mac
xcodebuild -scheme VaultKey -configuration Release build
```

## 环境变量

### 前端环境变量

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=VaultKey
```

### 后端环境变量

创建 `api/.env` 文件：

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgres://user:password@localhost:5432/vaultkey
```