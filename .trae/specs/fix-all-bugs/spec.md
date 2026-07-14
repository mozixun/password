# 全系统Bug修复 Spec

## Why
对系统所有功能模块进行全面检查后发现大量bug，涵盖安全漏洞、功能缺失、路由错误、状态管理问题等，需要系统性修复以确保每项功能可用且无bug。

## What Changes

### P0 安全修复
- 修复主密码仅用 base64 存储问题，改用 PBKDF2 派生
- 修复 passkey 认证失败时返回 success:true 的错误
- 修复 `Math.random()` 生成恢复密钥的安全隐患
- 修复 `authenticateWithPasskey` 失败时返回 success:true 的错误

### P1 核心功能修复
- 修复 Login 页面 register 调用 `auth.login` 而非注册方法
- 修复 Login 登录后跳转到 `/unlock` 而非 `/dashboard`
- 修复 `/unlock` 路由未包裹 AuthRoute，未认证可直接访问
- 修复 store 中 `checkAutoLock`、`resetActivityTimer`、`incrementUsage`、`runFullAudit` 已定义但从未调用
- 修复 `toggleTravelMode` 逻辑反转
- 修复 Dashboard 跳转路径错误 `/items/:id` 应为 `/items/detail/:id`
- 修复 Unlock 页面 `failedAttempts` 剩余次数计算多减1
- 修复 Items 页面 `typeFilters` 缺少多种类型筛选
- 修复 Watchtower 页面 `expiryDate || updatedAt` 误判过期
- 修复 ItemDetail 保存时不校验必填字段
- 修复 ItemDetail 密码历史不写入 `passwordHistory`
- 修复 Generator 中密码短语生成不写入历史记录
- 修复 Generator Toggle 组件 label 点击不触发切换
- 修复 Sidebar 搜索栏为 div 无法输入
- 修复 AppLayout "新建"按钮无 onClick
- 修复 Settings 中"更新密码"按钮无 onClick
- 修复 Watchtower 中多个"更新"按钮无 onClick
- 修复 Vaults 中"共享"和"归档"按钮无功能
- 修复 Settings 中旅行模式显示逻辑反转

### P2 UI/UX 修复
- 修复 AppLayout breadcrumb 硬编码"所有项目"
- 修复 Home 页面安全分数硬编码
- 修复 Settings 中 `true ?` 三元恒真
- 修复 mock 数据中 alert.itemId 与 item.title 不匹配
- 修复 breachDetection 中 `sha1` 比较逻辑错误
- 修复 totp.ts 中 `parseOTPUri` 的 slice 偏移
- 修复 ItemCard 中 `item.password!` 非空断言

### P3 代码质量
- 移除未使用的导入
- 修复 `checkBreach` 中错误展开整个 state

## Impact
- 受影响代码: store/index.ts, App.tsx, Login.tsx, Unlock.tsx, Dashboard.tsx, Items.tsx, ItemDetail.tsx, Generator.tsx, Watchtower.tsx, Settings.tsx, Vaults.tsx, AppLayout.tsx, Sidebar.tsx, ItemCard.tsx, passkey.ts, breachDetection.ts, totp.ts, Home.tsx, Authenticator.tsx

## ADDED Requirements

### Requirement: 自动锁定计时器
系统 SHALL 在应用闲置超过设定时间后自动锁定保险库。
#### Scenario: 闲置超时自动锁定
- **WHEN** 用户在 `autoLockMinutes` 时间内无任何操作
- **THEN** 应用自动锁定，跳转到解锁页

### Requirement: 安全审计自动执行
系统 SHALL 在进入安全中心页面时自动执行安全审计。
#### Scenario: 打开安全中心
- **WHEN** 用户导航到 Watchtower 页面
- **THEN** 系统自动调用 `runFullAudit` 并显示最新审计结果

## MODIFIED Requirements

### Requirement: 主密码验证
主密码 SHALL 使用 PBKDF2 派生后比对，不再使用 base64 直接存储。解锁时输入的密码经相同派生流程后与存储值比对。

### Requirement: 恢复密钥
恢复密钥 SHALL 由 `crypto.getRandomValues` 生成，不再使用 `Math.random()`。

### Requirement: 旅行模式
启用旅行模式时 SHALL 隐藏选中的保险库，禁用时 SHALL 显示所有保险库。当前逻辑反转，需修正。

### Requirement: 路由保护
`/unlock` 路由 SHALL 检查 `isAuthenticated` 状态，未认证用户重定向到登录页。

### Requirement: 密码生成器历史记录
生成密码或密码短语时 SHALL 自动写入历史记录。密码短语 SHALL 与普通密码一样通过 store 管理历史。

## REMOVED Requirements

### Requirement: Touch ID 绕过解锁
**Reason**: 通过 `atob(masterPasswordHash)` 反解密码绕过验证，是安全漏洞
**Migration**: Touch ID 按钮改为检查平台认证器可用性，不再绕过密码验证
