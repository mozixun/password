# Tasks

- [x] Task 1: 扩展类型定义（types/index.ts）
  - [x] 新增 `SubscriptionPlan` 类型（`'free' | 'premium' | 'family' | 'team'`）
  - [x] 新增 `Subscription` 接口（plan, startAt, expiresAt, source, redeemCodeId）
  - [x] 新增 `RedeemCode` 接口（id, code, planType, totalUses, usedCount, expiresAt, enabled, createdAt）
  - [x] 新增 `Notification` 接口（id, type, title, message, read, createdAt）
  - [x] 新增 `NotificationSettings` 接口（smtpHost, smtpPort, senderEmail, senderName, enabled）
  - [x] 扩展 `UserProfile` 接口，新增 `subscription: Subscription` 字段
  - [x] 扩展 `AdminSettings` 接口，新增 `notificationConfig: NotificationSettings` 和 `redeemCodes: RedeemCode[]` 字段

- [x] Task 2: 扩展 Store 状态管理（store/index.ts）
  - [x] 新增 `NotificationState` 切片接口（notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification, clearAll）
  - [x] 新增 `SubscriptionState` 切片接口（subscription, redeemCode, updateSubscription, applyRedeemCode）
  - [x] 在 `StoreState` 中注册两个新切片
  - [x] 扩展 `AdminState` 接口，新增 `redeemCodes`、`notificationConfig` 相关操作
  - [x] 新增 `generateRedeemCode`、`toggleRedeemCode`、`deleteRedeemCode`、`updateNotificationConfig` 方法
  - [x] 添加 mock 数据：模拟通知列表、模拟兑换码列表、模拟通知邮箱配置、模拟用户订阅详情
  - [x] 新增选择器钩子：`useNotifications`、`useSubscription`

- [x] Task 3: 管理员兑换码管理页面（新建 AdminRedeemCodes.tsx）
  - [x] 使用 `AdminLayout` 布局
  - [x] 兑换码生成表单：类型选择、有效期输入、可用次数输入、批量数量输入（1-100）、自定义码输入
  - [x] 兑换码列表表格：码、类型、有效期、已用/总次数、状态（启用/禁用/过期）、操作按钮
  - [x] 支持启用/禁用单个兑换码
  - [x] 支持复制兑换码到剪贴板
  - [x] 支持搜索/筛选兑换码
  - [x] 兑换码过期状态自动计算并显示

- [x] Task 4: 管理员设置页面扩展通知邮箱配置（AdminSettings.tsx）
  - [x] 新增"通知邮箱配置"板块（SMTP服务器、端口、发件邮箱、显示名称、启用开关）
  - [x] 表单字段绑定 admin store 中的 notificationConfig
  - [x] 保存按钮更新 store 并显示成功提示
  - [x] 与现有板块保持一致的深色主题样式

- [x] Task 5: 管理员侧边栏增加兑换码入口（AdminSidebar.tsx）
  - [x] 在侧边栏导航中添加"兑换码管理"菜单项
  - [x] 使用 Gift/Ticket 图标（Lucide）
  - [x] 链接到 `/admin/redeem-codes`
  - [x] 当前路由高亮状态

- [x] Task 6: 用户个人资料页扩展订阅与兑换功能（Profile.tsx）
  - [x] 新增"我的订阅"板块：显示当前计划、有效期、剩余天数、订阅来源
  - [x] 新增"兑换码兑换"板块：输入框、兑换按钮、格式验证
  - [x] 兑换逻辑：调用 store 的 applyRedeemCode 方法
  - [x] 兑换结果反馈：成功/失败 Toast 提示
  - [x] 订阅过期预警：如果7天内过期显示红色警告

- [x] Task 7: 注册新路由（App.tsx）
  - [x] 懒加载导入 `AdminRedeemCodes` 组件
  - [x] 已注册 `/admin/redeem-codes` 受保护路由

- [x] Task 8: 构建验证
  - [x] 运行 `npx vite build` 确认无编译错误

# Task Dependencies
- Task 1 必须在 Task 2 之前完成
- Task 2 必须在 Task 3、4、6 之前完成
- Task 3 和 Task 4 和 Task 5 可以并行
- Task 6 依赖 Task 2
- Task 7 依赖 Task 3
- Task 8 依赖所有其他任务
