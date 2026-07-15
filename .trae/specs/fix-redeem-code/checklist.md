# Checklist

## 类型定义
- [x] `RedeemCode` 接口已添加 `subscriptionDays: number` 字段
- [x] mock 兑换码数据已包含 `subscriptionDays` 字段

## Store 状态管理
- [x] `generateRedeemCode` 方法签名已更新，包含 `subscriptionDays` 参数
- [x] `generateRedeemCode` 实现正确存储 `subscriptionDays`
- [x] `generateRedeemCode` 使用精确的截止日期计算 `expiresAt`
- [x] `applyRedeemCode` 兑换码查找逻辑正确，能匹配到生成的兑换码
- [x] `applyRedeemCode` 使用兑换码的 `subscriptionDays` 计算用户订阅过期时间

## 管理员兑换码页面（AdminRedeemCodes.tsx）
- [x] 生成表单包含"套餐天数"输入框
- [x] 生成表单包含"使用截止日期"日期选择器（精确到年月日）
- [x] 兑换码列表表格显示"套餐天数"列
- [x] 兑换码列表表格显示"使用截止日期"列（仅日期部分）
- [x] 表单验证逻辑正确

## 用户兑换页面（Profile.tsx）
- [x] 兑换功能正常工作，不再提示"兑换码不存在"
- [x] 兑换成功后显示用户获得的订阅天数

## 构建验证
- [x] `npx vite build` 成功完成，无编译错误
