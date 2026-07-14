# VaultKey 1Panel 部署指南

## 项目概述

VaultKey 是一个前后端分离的密码管理器应用：
- **前端**：React 18 + TypeScript + Vite
- **后端**：Express + TypeScript
- **部署路径**：`/vaultkey/`
- **API 路径**：`/api/`

## 部署前准备

### 1. 服务器要求
- 已安装 1Panel 面板
- 服务器已安装 Docker（1Panel 通常会自动安装）
- 至少 1GB 内存
- 至少 2GB 磁盘空间

### 2. 域名准备
- 准备一个域名（如 `vaultkey.example.com`）
- 域名已解析到服务器 IP

## 部署方式一：Docker Compose 部署（推荐）

### 步骤 1：上传项目文件

1. 登录 1Panel 面板
2. 进入「文件」菜单
3. 在 `/opt/` 目录下创建 `vaultkey` 文件夹
4. 将以下文件上传到 `/opt/vaultkey/` 目录：
   - 整个项目源代码（除了 node_modules、dist 等）
   - `Dockerfile.frontend`
   - `Dockerfile.backend`
   - `docker-compose.yml`
   - `nginx.conf`
   - `.dockerignore`

### 步骤 2：使用 1Panel 容器编排部署

1. 登录 1Panel 面板
2. 进入「容器」→「编排」
3. 点击「创建编排」
4. 填写信息：
   - **名称**：`vaultkey`
   - **描述**：VaultKey 密码管理器
5. 在「编排模板」中，粘贴 `docker-compose.yml` 的内容
6. 点击「确认」创建

### 步骤 3：配置反向代理

1. 进入 1Panel「网站」→「网站」
2. 点击「创建网站」→「反向代理」
3. 填写信息：
   - **主域名**：你的域名（如 `vaultkey.example.com`）
   - **代理地址**：`http://127.0.0.1:8080`
4. 点击「确认」创建

### 步骤 4：启用 SSL（可选但推荐）

1. 进入网站设置
2. 点击「SSL」
3. 选择「Let's Encrypt」申请免费证书
4. 开启「强制 HTTPS」

## 部署方式二：手动 Docker 部署

### 步骤 1：连接服务器

使用 SSH 连接到你的服务器：
```bash
ssh root@your-server-ip
```

### 步骤 2：上传项目文件

将项目文件上传到服务器：
```bash
cd /opt
git clone <your-repo-url> vaultkey
cd vaultkey
```

或者使用 scp 上传：
```bash
scp -r ./local-project root@your-server-ip:/opt/vaultkey
```

### 步骤 3：构建并启动容器

```bash
cd /opt/vaultkey
docker-compose up -d --build
```

### 步骤 4：查看运行状态

```bash
docker-compose ps
docker-compose logs -f
```

### 步骤 5：配置 1Panel 反向代理

同方式一的步骤 3-4。

## 部署方式三：纯静态站点 + Node 后端

如果你不想用 Docker，可以分别部署前端和后端：

### 前端部署（静态站点）

1. 本地构建：
   ```bash
   npm install
   npx vite build
   ```

2. 将 `dist` 目录内容上传到服务器

3. 在 1Panel 中创建静态网站，指向 dist 目录

4. 在网站设置的「伪静态」中添加：
   ```nginx
   location /vaultkey/ {
       try_files $uri $uri/ /vaultkey/index.html;
   }
   
   location /api/ {
       proxy_pass http://127.0.0.1:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
   ```

### 后端部署（Node 项目）

1. 在 1Panel 中进入「运行环境」→「Node」
2. 安装 Node.js 20.x
3. 进入「项目」→「创建项目」
4. 选择 Node 版本，设置项目目录为 api 目录
5. 启动命令：`npx tsx api/server.ts`
6. 端口：`3001`

## 验证部署

部署完成后，访问以下地址验证：

1. **前端页面**：`https://your-domain.com/vaultkey/`
2. **API 健康检查**：`https://your-domain.com/api/health`

预期返回：
```json
{
  "success": true,
  "message": "ok"
}
```

## 常用管理命令

### 查看容器状态
```bash
docker-compose ps
```

### 查看日志
```bash
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 重启服务
```bash
docker-compose restart
```

### 更新代码后重新部署
```bash
docker-compose down
docker-compose up -d --build
```

### 停止并删除容器
```bash
docker-compose down
```

## 注意事项

1. **数据存储**：当前版本数据存储在浏览器本地（localStorage），服务器不存储密码数据
2. **备份**：定期导出密码数据作为备份
3. **安全**：务必启用 HTTPS，保护数据传输安全
4. **端口冲突**：如果 8080 端口被占用，修改 `docker-compose.yml` 中的端口映射
5. **内存限制**：服务器内存较小时，可以考虑限制容器内存使用

## 故障排查

### 502 Bad Gateway
- 检查后端容器是否正常运行：`docker-compose ps`
- 查看后端日志：`docker-compose logs backend`

### 前端页面空白
- 检查浏览器控制台是否有错误
- 确认 Nginx 配置正确
- 检查静态文件是否正确部署

### API 请求失败
- 检查 API 健康检查端点是否正常
- 确认反向代理配置正确
- 查看后端日志排查错误

## 文件说明

| 文件名 | 说明 |
|--------|------|
| `Dockerfile.frontend` | 前端 Docker 镜像构建文件 |
| `Dockerfile.backend` | 后端 Docker 镜像构建文件 |
| `docker-compose.yml` | Docker Compose 编排文件 |
| `nginx.conf` | Nginx 配置文件 |
| `.dockerignore` | Docker 构建忽略文件 |
