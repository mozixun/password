# VaultKey - 项目详情功能修复 - 实施计划

## [x] Task 1: 在 ItemCard 组件中添加删除按钮
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `/workspace/src/components/ItemCard.tsx`
  - 在悬停操作区域添加删除按钮
  - 使用 `useItems` store 的 `deleteItem` 方法
  - 添加确认对话框
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 构建成功（npm run build 返回 0）✅
  - `human-judgement` TR-1.2: 悬停项目卡片显示删除按钮，点击确认后项目被删除 ✅

## [x] Task 2: 在登录类型项目编辑表单中添加 TOTP 输入字段
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `/workspace/src/pages/ItemDetail.tsx`
  - 在登录类型编辑表单中添加 TOTP 密钥输入框
  - 使用 `totp` 字段（与查看模式一致）
  - 支持 Base32 编码密钥输入
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 构建成功（npm run build 返回 0）✅
  - `human-judgement` TR-2.2: 编辑登录项目时显示 TOTP 输入框，输入密钥后保存并查看 TOTP 验证码正常显示 ✅

## [x] Task 3: 在登录类型项目编辑表单中添加 Passkey 创建功能
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 修改 `/workspace/src/pages/ItemDetail.tsx`
  - 在登录类型编辑表单中添加 Passkey 创建按钮
  - 使用现有的 `createPasskey` 工具函数
  - 显示 Passkey 支持检查和创建状态
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-3.1: 构建成功（npm run build 返回 0）✅
  - `human-judgement` TR-3.2: 编辑登录项目时显示 Passkey 创建按钮，点击后可创建并保存 Passkey ✅