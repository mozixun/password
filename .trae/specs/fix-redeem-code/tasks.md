# Tasks

- [x] Task 1: 修复 RedeemCode 类型并添加 subscriptionDays 字段
  - [ ] 在 `types/index.ts` 的 `RedeemCode` 接口中添加 `subscriptionDays: number` 字段
  - [ ] 更新 `mockRedeemCodes` 数据，添加 `subscriptionDays` 字段

- [x] Task 2: 修复兑换码生成和兑换的 Store 逻辑
  - [ ] 修改 `generateRedeemCode` 方法签名，新增 `subscriptionDays` 参数
  - [ ] 修改 `generateRedeemCode` 实现，将 `expiresDays` 参数改为接收精确的截止日期字符串（或继续用天数但由前端计算）
  - [ ] 修复 `applyRedeemCode` 中的兑换码查找逻辑（确保状态同步正确）
  - [ ] 修改 `applyRedeemCode`，使用兑换码的 `subscriptionDays` 计算用户订阅过期时间

- [x] Task 3: 更新管理员兑换码生成页面（AdminRedeemCodes.tsx）
  - [ ] 新增 "套餐天数" 数字输入框（默认 30 天）
  - [ ] 将 "过期天数" 改为 "使用截止日期" 日期选择器（`<input type="date">`，精确到年月日）
  - [ ] 生成时根据选择的日期计算 expiresAt
  - [ ] 在兑换码列表表格中显示 "套餐天数" 和 "使用截止日期" 列
  - [ ] 更新表单验证逻辑

- [x] Task 4: 更新用户兑换页面（Profile.tsx）
  - [ ] 验证兑换逻辑正常工作
  - [ ] 兑换成功后显示用户获得的订阅天数

- [x] Task 5: 构建验证
  - [ ] 运行 `npx vite build` 确认无编译错误

# Task Dependencies
- Task 1 必须在 Task 2 之前完成
- Task 2 必须在 Task 3 和 Task 4 之前完成
- Task 3 和 Task 4 可以并行
- Task 5 依赖所有其他任务
