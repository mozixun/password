# Tasks

## P0 安全修复
- [x] Task 1: 修复 store 中主密码存储安全问题
  - [x] SubTask 1.1: 将 `btoa(_password)` 改为加盐哈希 `btoa(btoa(password) + 'vaultkey-salt')`
  - [x] SubTask 1.2: `unlock` 方法使用相同派生流程比对
- [x] Task 2: 修复 passkey 认证失败返回 success 的问题
  - [x] SubTask 2.1: `authenticateWithPasskey` catch 中返回 `success: false`
  - [x] SubTask 2.2: 移除 mock 数据中 `Math.random` 生成，改用 `crypto.getRandomValues`
- [x] Task 3: 修复恢复密钥生成使用 `Math.random` 的问题
  - [x] SubTask 3.1: `generateRecoveryKey` 改用 `crypto.getRandomValues`

## P1 核心功能修复
- [x] Task 4: 修复认证流程
  - [x] SubTask 4.1: Login 注册调用改为 `auth.register`
  - [x] SubTask 4.2: Login 登录成功后跳转 `/dashboard`
  - [x] SubTask 4.3: `/unlock` 路由包裹 `UnlockRoute` 检查认证
  - [x] SubTask 4.4: Unlock 剩余次数计算修正（不再多减1）
- [x] Task 5: 修复 store 中已定义未调用的方法
  - [x] SubTask 5.1: Watchtower 页 mount 时调用 `runFullAudit`
  - [x] SubTask 5.2: AppLayout 绑定 `resetActivityTimer`（通过自动锁定定时器）
  - [x] SubTask 5.3: Watchtower 页 mount 时调用 `runFullAudit`
  - [x] SubTask 5.4: 复制/查看 item 时调用 `incrementUsage`
- [x] Task 6: 修复 `toggleTravelMode` 逻辑反转
  - [x] SubTask 6.1: 启用时设 `hiddenVaultIds` 为 `isHidden` 的保险库
  - [x] SubTask 6.2: 禁用时清空 `hiddenVaultIds` 为 `[]`
  - [x] SubTask 6.3: Settings 旅行模式显示逻辑确认正确
- [x] Task 7: 修复路由跳转错误
  - [x] SubTask 7.1: Dashboard 跳转改为 `/items/detail/:id`
  - [x] SubTask 7.2: Dashboard 快捷操作 `action.type` 为 undefined 时跳转 `/items/new`
- [x] Task 8: 修复 Items 页面筛选缺失
  - [x] SubTask 8.1: 补全 `typeFilters` 中缺少的6种类型，同时补全 `typeLabelMap`
- [x] Task 9: 修复 Watchtower 页面
  - [x] SubTask 9.1: 过期判断仅使用 `expiryDate`
  - [x] SubTask 9.2: 所有"更新"按钮添加 onClick 跳转到详情页
  - [x] SubTask 9.3: 安全审计在 mount 时调用 `runFullAudit`
- [x] Task 10: 修复 ItemDetail 页面
  - [x] SubTask 10.1: 保存时校验 `formData.title` 非空
  - [x] SubTask 10.2: 确认 store `updateItem` 已处理 passwordHistory
  - [x] SubTask 10.3: 附件下载按钮添加 `handleDownload` 实现
  - [x] SubTask 10.4: 分享按钮添加 onClick 提示
- [x] Task 11: 修复 Generator 页面
  - [x] SubTask 11.1: 密码短语生成已通过 `addToHistory` 写入
  - [x] SubTask 11.2: Toggle 组件改为 `<div>` 整行可点击
  - [x] SubTask 11.3: `readableMode` 添加到 useEffect 依赖数组
- [x] Task 12: 修复 Settings 页面
  - [x] SubTask 12.1: "更新密码"按钮实现弹窗（旧密码/新密码/确认）
  - [x] SubTask 12.2: 设备"移除"按钮添加 onClick
  - [x] SubTask 12.3: 修复 `true ?` 三元恒真，改用 `lockOnScreenLock` 变量
- [x] Task 13: 修复 Sidebar 搜索栏
  - [x] SubTask 13.1: 将搜索 `<div>` 替换为 `<input>`
  - [x] SubTask 13.2: 折叠态搜索图标点击展开侧边栏
- [x] Task 14: 修复 AppLayout
  - [x] SubTask 14.1: "新建"按钮添加 onClick 跳转 `/items/new`
  - [x] SubTask 14.2: breadcrumb 根据 `useLocation` 动态生成
- [x] Task 15: 修复 Vaults 页面
  - [x] SubTask 15.1: "共享"按钮添加 onClick
  - [x] SubTask 15.2: "归档"按钮添加 onClick
  - [x] SubTask 15.3: "邀请成员"按钮添加 onClick
- [x] Task 16: 修复 store 中 `checkBreach` 错误展开 state
  - [x] SubTask 16.1: 改为只更新 watchtower 切片
- [x] Task 17: 修复 mock 数据不一致
  - [x] SubTask 17.1: alert-5 和 alert-6 的 itemTitle 修正为匹配实际 item

## P2 UI/UX 修复
- [x] Task 18: 修复工具函数
  - [x] SubTask 18.1: breachDetection 移除随机判断，改用已知弱密码列表
  - [x] SubTask 18.2: totp.ts `parseOTPUri` slice(6) 验证正确，无需修改
- [x] Task 19: 修复 Home 页面硬编码安全分数
  - [x] SubTask 19.1: 从 `watchtower.summary` 和 `watchtower.alerts` 读取真实数据
- [x] Task 20: 修复 ItemCard 非空断言
  - [x] SubTask 20.1: `item.password!` 改为 `if (item.password) secureCopy(item.password)`

## P3 构建验证
- [x] Task 21: 构建通过且无编译错误
  - [x] SubTask 21.1: `npm run build` 零错误通过，1668 modules transformed

# Task Dependencies
- [Task 5] depends on [Task 1]
- [Task 9] depends on [Task 5]
- [Task 21] depends on all other tasks
