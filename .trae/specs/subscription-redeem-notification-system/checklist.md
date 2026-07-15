# Checklist

## 类型定义
- [x] `SubscriptionPlan` 类型已正确定义为联合类型 `'free' | 'premium' | 'family' | 'team'`
- [x] `Subscription` 接口包含 plan、startAt、expiresAt、source、redeemCodeId 字段
- [x] `RedeemCode` 接口包含 id、code、planType、totalUses、usedCount、expiresAt、enabled、createdAt 字段
- [x] `Notification` 接口包含 id、type、title、message、read、createdAt 字段
- [x] `NotificationSettings` 接口包含 smtpHost、smtpPort、senderEmail、senderName、enabled 字段
- [x] `UserProfile` 已扩展 `subscription: Subscription` 字段
- [x] `AdminSettings` 已扩展 `notificationConfig: NotificationSettings` 和 `redeemCodes: RedeemCode[]` 字段

## Store 状态管理
- [x] `NotificationState` 切片包含 notifications、unreadCount、addNotification、markAsRead、markAllAsRead、clearNotification、clearAll
- [x] `SubscriptionState` 切片包含 subscription、applyRedeemCode
- [x] `AdminState` 已扩展 redeemCodes 和 notificationConfig 相关操作方法
- [x] `generateRedeemCode` 方法支持批量生成和自定义码
- [x] `toggleRedeemCode` 方法正确切换兑换码启用状态
- [x] `deleteRedeemCode` 方法正确删除兑换码
- [x] `updateNotificationConfig` 方法正确更新通知配置
- [x] `applyRedeemCode` 方法正确验证兑换码并升级订阅
- [x] 模拟数据已添加（通知列表、兑换码列表、通知配置、用户订阅）
- [x] 新增 `useNotifications` 和 `useSubscription` 选择器钩子

## 管理员兑换码页面（AdminRedeemCodes.tsx）
- [x] 页面使用 AdminLayout 布局
- [x] 兑换码生成表单包含：类型选择、有效期输入、可用次数输入、批量数量输入（1-100）、自定义码输入
- [x] 兑换码列表表格正确显示所有字段
- [x] 支持启用/禁用单个兑换码
- [x] 支持复制兑换码到剪贴板
- [x] 支持搜索/筛选兑换码
- [x] 兑换码过期状态自动计算并正确显示

## 管理员设置页面通知邮箱配置（AdminSettings.tsx）
- [x] 新增"通知邮箱配置"板块
- [x] 包含 SMTP 服务器、端口、发件邮箱、显示名称、启用开关字段
- [x] 表单正确绑定 admin store
- [x] 保存后显示成功提示
- [x] 样式与现有板块一致（深色主题）

## 管理员侧边栏（AdminSidebar.tsx）
- [x] 已添加"兑换码管理"菜单项
- [x] 使用 Gift/Ticket 图标
- [x] 链接到 `/admin/redeem-codes`
- [x] 当前路由高亮正确

## 用户个人资料页（Profile.tsx）
- [x] 新增"我的订阅"板块，显示计划、有效期、剩余天数、来源
- [x] 新增"兑换码兑换"板块，包含输入框和兑换按钮
- [x] 兑换码格式验证（6-20位字母数字）
- [x] 兑换成功/失败有明确提示
- [x] 兑换成功后订阅状态即时更新
- [x] 订阅7天内过期显示红色警告

## 路由（App.tsx）
- [x] 已懒加载导入 AdminRedeemCodes
- [x] 已注册 `/admin/redeem-codes` 受保护路由

## 构建验证
- [x] `npx vite build` 成功完成，无编译错误
