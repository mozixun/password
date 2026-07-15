# 用户域名允许列表与自动填充匹配规则设置 - 实施计划

## [x] Task 1: 扩展 VaultSettings 类型定义
- **Priority**: high
- **Depends On**: None
- **Description**: 在 `types/index.ts` 的 `VaultSettings` 接口中添加域名配置相关字段：`allowedDomains`、`blockedDomains`、`matchMode`
- **Acceptance Criteria Addressed**: FR-5
- **Test Requirements**:
  - `programmatic` TR-1.1: `VaultSettings` 接口包含 `allowedDomains: string[]`、`blockedDomains: string[]`、`matchMode: 'exact' | 'fuzzy'` 字段
  - `human-judgement` TR-1.2: 类型定义符合 TypeScript 语法规范，无编译错误

## [x] Task 2: 扩展用户级 Store 的 SettingsState
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 在 `store/index.ts` 的 `SettingsState` 切片中添加域名配置相关方法：`addAllowedDomain`、`removeAllowedDomain`、`addBlockedDomain`、`removeBlockedDomain`、`setMatchMode`，并添加 mock 数据
- **Acceptance Criteria Addressed**: FR-5
- **Test Requirements**:
  - `programmatic` TR-2.1: `SettingsState` 接口包含所有域名操作方法
  - `human-judgement` TR-2.2: 方法实现正确更新状态，mock 数据初始化正确

## [x] Task 3: 用户设置页面添加域名规则配置
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 在 `Settings.tsx` 的安全设置部分添加域名允许列表、域名阻止列表和自动填充匹配模式设置，与管理员设置页面的交互逻辑保持一致
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3
- **Test Requirements**:
  - `human-judgement` TR-3.1: 页面显示域名允许列表，支持添加和删除
  - `human-judgement` TR-3.2: 页面显示域名阻止列表，支持添加和删除
  - `human-judgement` TR-3.3: 页面显示匹配模式切换按钮（精确/模糊）
  - `human-judgement` TR-3.4: 所有操作有成功提示反馈
  - `human-judgement` TR-3.5: 样式与现有用户设置页面保持一致

## [x] Task 4: 管理员设置页面移除域名规则功能
- **Priority**: high
- **Depends On**: None
- **Description**: 在 `AdminSettings.tsx` 中移除域名允许列表、域名阻止列表和自动填充匹配规则相关的所有代码（state、方法、UI）
- **Acceptance Criteria Addressed**: FR-4
- **Test Requirements**:
  - `human-judgement` TR-4.1: 管理员设置页面不再显示域名允许列表
  - `human-judgement` TR-4.2: 管理员设置页面不再显示域名阻止列表
  - `human-judgement` TR-4.3: 管理员设置页面不再显示自动填充匹配规则
  - `human-judgement` TR-4.4: 相关的 state 变量和方法已删除

## [x] Task 5: 构建验证
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**: 运行 `npx vite build` 确认代码无编译错误
- **Acceptance Criteria Addressed**: NFR-3
- **Test Requirements**:
  - `programmatic` TR-5.1: `npx vite build` 成功完成，退出码为 0
