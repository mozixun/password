# 用户域名允许列表与自动填充匹配规则设置 - 验证清单

## 类型定义
- [x] `VaultSettings` 接口已添加 `allowedDomains: string[]`、`blockedDomains: string[]`、`matchMode: 'exact' | 'fuzzy'` 字段

## Store 状态管理
- [x] `SettingsState` 切片已添加 `addAllowedDomain`、`removeAllowedDomain`、`addBlockedDomain`、`removeBlockedDomain`、`setMatchMode` 方法
- [x] 用户级域名配置 mock 数据已添加

## 用户设置页面（Settings.tsx）
- [x] 页面显示域名允许列表，包含添加输入框和现有域名列表
- [x] 域名允许列表支持添加域名（输入域名后点击添加或按回车）
- [x] 域名允许列表支持删除域名（点击删除按钮）
- [x] 页面显示域名阻止列表，包含添加输入框和现有域名列表
- [x] 域名阻止列表支持添加域名
- [x] 域名阻止列表支持删除域名
- [x] 页面显示自动填充匹配模式切换按钮（精确匹配/模糊匹配）
- [x] 匹配模式切换时有成功提示反馈
- [x] 添加/删除域名时有成功提示反馈
- [x] 样式与现有用户设置页面保持一致

## 管理员设置页面（AdminSettings.tsx）
- [x] 页面不再显示域名允许列表
- [x] 页面不再显示域名阻止列表
- [x] 页面不再显示自动填充匹配规则
- [x] 域名相关的 state 变量已删除
- [x] 域名相关的方法已删除

## 构建验证
- [x] `npx vite build` 成功完成，无编译错误
