# 订阅系统、通知系统与兑换码功能 Spec

## Why
当前 VaultKey 密码管理器仅有一个基础的 `UserProfile.plan` 字段标记订阅状态，缺乏完整的订阅生命周期管理、通知推送机制和运营工具（兑换码）。管理员无法通过后台配置系统通知邮箱或发放兑换码，用户也无法自助兑换，导致运营灵活性和用户体验不足。

## What Changes
- 在 `types/index.ts` 中新增 `SubscriptionPlan`、`Subscription`、`RedeemCode`、`Notification`、`NotificationSettings` 类型定义
- 在 `store/index.ts` 中新增 `subscription` 和 `notification` 两个 Zustand 状态切片
- 在管理员路由 `/admin/settings` 增加通知邮箱配置面板和兑换码生成管理面板
- 新建管理员页面 `/admin/redeem-codes`，支持批量生成、启用/禁用、过期处理兑换码
- 在用户个人资料页 `/profile` 增加兑换码输入和兑换功能
- 在 `store` 中增加 `notifications` 数据切片及标记已读/已清除逻辑
- 在管理员侧边栏 `AdminSidebar` 增加兑换码管理入口
- 在 App.tsx 中注册新路由 `/admin/redeem-codes`

## Impact
- **Affected specs**: 管理员后台体系、用户个人资料体系、全局状态管理
- **Affected code**:
  - `/workspace/src/types/index.ts`
  - `/workspace/src/store/index.ts`
  - `/workspace/src/pages/AdminSettings.tsx`
  - `/workspace/src/pages/AdminSidebar.tsx`
  - `/workspace/src/pages/Profile.tsx`
  - `/workspace/src/App.tsx`
  - 新建 `/workspace/src/pages/AdminRedeemCodes.tsx`

## ADDED Requirements

### Requirement: 订阅类型定义
系统 SHALL 支持多档订阅计划：
- `free`（免费，功能受限）
- `premium`（高级，全功能）
- `family`（家庭，支持共享）
- `team`（团队，多成员）

### Requirement: 订阅状态管理
系统 SHALL 在用户资料中记录完整的订阅信息，包括：
- 当前计划类型
- 订阅开始时间
- 订阅过期时间（可为空表示永久）
- 订阅来源（`direct` / `redeemed`）
- 兑换码记录（如果是通过兑换码激活）

#### Scenario: 用户查看订阅信息
- **WHEN** 用户访问个人资料页面
- **THEN** 显示当前订阅计划、有效期、剩余天数

#### Scenario: 订阅过期提醒
- **WHEN** 订阅将在7天内过期
- **THEN** 系统自动生成一条通知提醒用户续费

### Requirement: 通知系统
系统 SHALL 提供统一的通知中心，支持：
- 系统通知（订阅到期、安全警报、系统公告）
- 通知已读/未读状态管理
- 通知清除功能
- 通知计数角标

#### Scenario: 用户查看通知
- **WHEN** 用户点击通知图标
- **THEN** 展开通知列表，显示所有通知，未读通知高亮

#### Scenario: 用户标记通知已读
- **WHEN** 用户点击通知条目
- **THEN** 该通知标记为已读，角标计数减少

### Requirement: 管理员配置通知邮箱
系统 SHALL 允许管理员在后台配置系统通知的发件人邮箱：
- SMTP 服务器地址
- SMTP 端口
- 发件人邮箱地址
- 发件人显示名称
- 是否启用邮件通知

#### Scenario: 管理员保存通知邮箱配置
- **WHEN** 管理员填写并保存通知邮箱配置
- **THEN** 配置即时保存到 admin store，并显示成功提示

### Requirement: 管理员生成兑换码
系统 SHALL 允许管理员批量生成兑换码：
- 选择兑换码类型（`premium`、`family`、`team`）
- 设置有效期（天数）
- 设置每个兑换码可用次数（默认1次）
- 批量生成数量（1-100个）
- 支持手动输入自定义兑换码
- 查看兑换码列表（码、类型、有效期、使用次数、状态）
- 支持启用/禁用兑换码
- 兑换码过期后自动标记为失效

#### Scenario: 管理员批量生成兑换码
- **WHEN** 管理员选择类型、有效期、数量并点击生成
- **THEN** 系统生成指定数量的随机兑换码并显示在列表中

#### Scenario: 管理员禁用兑换码
- **WHEN** 管理员点击禁用按钮
- **THEN** 该兑换码立即失效，用户无法再兑换

### Requirement: 用户兑换码兑换功能
系统 SHALL 允许用户在个人资料页面输入兑换码进行兑换：
- 输入框验证兑换码格式（6-20位字母数字组合）
- 实时验证兑换码有效性（是否存在、未过期、未用完次数、未禁用）
- 兑换成功后升级用户订阅计划
- 记录兑换历史
- 显示兑换成功/失败提示

#### Scenario: 用户成功兑换
- **WHEN** 用户输入有效兑换码并点击兑换
- **THEN** 订阅计划立即升级，显示成功提示，更新订阅有效期

#### Scenario: 用户兑换无效码
- **WHEN** 用户输入已使用、已过期或不存在的兑换码
- **THEN** 显示对应的错误提示（"兑换码已使用"、"兑换码已过期"、"兑换码不存在"）

## MODIFIED Requirements

### Requirement: UserProfile 扩展
现有 `UserProfile` 接口扩展 `subscription` 字段，类型为 `Subscription`。

### Requirement: AdminSettings 扩展
现有 `AdminSettings` 接口扩展 `notificationConfig` 字段，类型为 `NotificationSettings`。

## REMOVED Requirements
无
