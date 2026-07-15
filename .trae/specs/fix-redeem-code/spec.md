# 兑换码功能修复与增强 Spec

## Why
当前兑换码系统存在两个关键问题：1）用户兑换生成的兑换码时提示"兑换码不存在"，无法正常兑换；2）兑换码不支持设置套餐天数，也不支持选择精确的使用截止日期，导致运营灵活性不足。

## What Changes
- 修复兑换码查找匹配逻辑，确保生成的兑换码可被正常识别和兑换
- 在 `RedeemCode` 类型中新增 `subscriptionDays` 字段，用于记录兑换后用户获得的订阅天数
- 将 `expiresAt` 的含义明确为"兑换码自身的使用截止日期"
- 在管理员兑换码生成页面新增"套餐天数"输入和"使用截止日期"日期选择器（精确到年月日）
- 修改 `applyRedeemCode` 逻辑，根据兑换码的 `subscriptionDays` 计算用户订阅过期时间
- 在兑换码列表中显示套餐天数和使用截止日期

## Impact
- Affected specs: 订阅系统、兑换码管理、用户兑换功能
- Affected code:
  - `/workspace/src/types/index.ts`
  - `/workspace/src/store/index.ts`
  - `/workspace/src/pages/AdminRedeemCodes.tsx`
  - `/workspace/src/pages/Profile.tsx`

## ADDED Requirements

### Requirement: 兑换码支持套餐天数
系统 SHALL 允许管理员在生成兑换码时设置套餐天数（用户兑换后获得的订阅时长）。

#### Scenario: 管理员生成带套餐天数的兑换码
- **WHEN** 管理员设置套餐天数为 30 天并生成兑换码
- **THEN** 兑换码记录中包含 subscriptionDays = 30

#### Scenario: 用户兑换后获得正确时长的订阅
- **WHEN** 用户兑换 subscriptionDays = 30 的兑换码
- **THEN** 用户订阅过期时间为当前时间 + 30 天

### Requirement: 兑换码支持精确使用截止日期
系统 SHALL 允许管理员在生成兑换码时选择精确的使用截止日期（年月日）。

#### Scenario: 管理员设置兑换码截止日期
- **WHEN** 管理员选择 2025-12-31 作为使用截止日期
- **THEN** 兑换码的 expiresAt 为该日期 23:59:59

### Requirement: 兑换码可正常兑换
系统 SHALL 修复兑换码查找逻辑，确保生成的兑换码可以被用户正常兑换。

#### Scenario: 用户兑换新生成的兑换码
- **WHEN** 用户输入刚生成的兑换码并点击兑换
- **THEN** 兑换成功，用户订阅升级

## MODIFIED Requirements

### Requirement: RedeemCode 类型扩展
`RedeemCode` 接口新增 `subscriptionDays: number` 字段。

### Requirement: applyRedeemCode 使用 subscriptionDays
`applyRedeemCode` 中订阅过期时间计算从固定 365 天改为使用兑换码的 `subscriptionDays`。

## REMOVED Requirements
无
