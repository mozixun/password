# API 文档

## 基础信息

- **基础 URL**：`http://localhost:3001/api`
- **认证方式**：JWT Bearer Token
- **内容类型**：`application/json`

## 认证端点

### 注册

**POST** `/auth/register`

请求体：

```json
{
  "email": "user@example.com",
  "verifier": "string",
  "salt": "string",
  "publicKey": "string"
}
```

响应：

```json
{
  "userId": "uuid",
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 登录初始化

**POST** `/auth/login/init`

请求体：

```json
{
  "email": "user@example.com"
}
```

响应：

```json
{
  "salt": "string",
  "serverEphemeral": "string"
}
```

### 登录验证

**POST** `/auth/login/verify`

请求体：

```json
{
  "email": "user@example.com",
  "clientEphemeral": "string",
  "clientProof": "string"
}
```

响应：

```json
{
  "serverProof": "string",
  "accessToken": "string",
  "refreshToken": "string"
}
```

### 刷新令牌

**POST** `/auth/refresh`

请求体：

```json
{
  "refreshToken": "string"
}
```

响应：

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

## 保管库端点

### 获取保管库列表

**GET** `/vaults`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "icon": "string",
    "color": "string",
    "encryptedKey": "string",
    "version": 1
  }
]
```

### 创建保管库

**POST** `/vaults`

请求头：

```
Authorization: Bearer <token>
```

请求体：

```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string",
  "encryptedKey": "string"
}
```

响应：

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string",
  "encryptedKey": "string",
  "version": 1
}
```

### 获取保管库详情

**GET** `/vaults/:vaultId`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string",
  "encryptedKey": "string",
  "version": 1,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 更新保管库

**PUT** `/vaults/:vaultId`

请求头：

```
Authorization: Bearer <token>
```

请求体：

```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string"
}
```

响应：

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "icon": "string",
  "color": "string",
  "encryptedKey": "string",
  "version": 2
}
```

### 删除保管库

**DELETE** `/vaults/:vaultId`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true
}
```

## 项目端点

### 获取项目列表

**GET** `/vaults/:vaultId/items`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
[
  {
    "id": "uuid",
    "vaultId": "uuid",
    "itemType": "login",
    "encryptedData": "string",
    "encryptedOverview": "string",
    "tags": [],
    "favorite": false,
    "version": 1,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### 创建项目

**POST** `/vaults/:vaultId/items`

请求头：

```
Authorization: Bearer <token>
```

请求体：

```json
{
  "itemType": "login",
  "encryptedData": "string",
  "encryptedOverview": "string",
  "tags": [],
  "favorite": false
}
```

响应：

```json
{
  "id": "uuid",
  "vaultId": "uuid",
  "itemType": "login",
  "encryptedData": "string",
  "encryptedOverview": "string",
  "tags": [],
  "favorite": false,
  "version": 1
}
```

### 获取项目详情

**GET** `/vaults/:vaultId/items/:itemId`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "id": "uuid",
  "vaultId": "uuid",
  "itemType": "login",
  "encryptedData": "string",
  "encryptedOverview": "string",
  "tags": [],
  "favorite": false,
  "version": 1,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 更新项目

**PUT** `/vaults/:vaultId/items/:itemId`

请求头：

```
Authorization: Bearer <token>
```

请求体：

```json
{
  "encryptedData": "string",
  "encryptedOverview": "string",
  "tags": [],
  "favorite": true
}
```

响应：

```json
{
  "id": "uuid",
  "vaultId": "uuid",
  "itemType": "login",
  "encryptedData": "string",
  "encryptedOverview": "string",
  "tags": [],
  "favorite": true,
  "version": 2
}
```

### 删除项目

**DELETE** `/vaults/:vaultId/items/:itemId`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true
}
```

## 同步端点

### 推送变更

**POST** `/sync/push`

请求头：

```
Authorization: Bearer <token>
```

请求体：

```json
{
  "vaultId": "uuid",
  "changes": [],
  "lastSyncVersion": 1
}
```

响应：

```json
{
  "serverVersion": 5,
  "conflicts": []
}
```

### 拉取变更

**GET** `/sync/pull?vaultId=uuid&sinceVersion=1`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "changes": [],
  "latestVersion": 5
}
```

## 安全中心端点

### 获取安全概况

**GET** `/watchtower/summary`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "score": 85,
  "weakPasswords": 2,
  "reusedPasswords": 3,
  "compromisedPasswords": 0,
  "expiredItems": 1
}
```

### 检查密码泄露

**GET** `/watchtower/breach-check?prefix=abc123`

请求头：

```
Authorization: Bearer <token>
```

响应：

```json
{
  "matches": [
    {
      "suffix": "def456",
      "count": 100
    }
  ]
}
```

## 错误响应

所有错误响应格式：

```json
{
  "error": "string",
  "message": "string",
  "code": 400
}
```

HTTP 状态码：
- `400`：请求参数错误
- `401`：未授权
- `403`：禁止访问
- `404`：资源不存在
- `500`：服务器错误