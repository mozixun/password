# 修复 ESLint 和代码质量问题

## Why
ESLint 检查发现了 31 个问题（29 个错误，2 个警告），包括未使用的变量、React hooks 依赖缺失等问题，这些问题可能导致运行时 bug 或性能问题。

## What Changes
- 清理未使用的 import 和变量
- 修复 React hooks 依赖数组缺失问题
- 修复空 catch 块问题
- 改进类型安全

## Impact
- Affected files:
  - `/workspace/src/components/AppLayout.tsx`
  - `/workspace/src/components/PasswordDisplay.tsx`
  - `/workspace/src/components/SecurityScore.tsx`
  - `/workspace/src/components/Sidebar.tsx`
  - `/workspace/src/pages/Authenticator.tsx`
  - `/workspace/src/pages/Dashboard.tsx`
  - `/workspace/src/pages/Generator.tsx`
  - `/workspace/src/pages/ItemDetail.tsx`
  - `/workspace/src/pages/Items.tsx`
  - `/workspace/src/pages/Watchtower.tsx`
  - `/workspace/src/utils/autofill.ts`
  - `/workspace/src/utils/breachDetection.ts`
  - `/workspace/src/utils/clipboard.ts`
  - `/workspace/src/utils/importExport.ts`
  - `/workspace/src/utils/passkey.ts`

## ADDED Requirements
### Requirement: 清理未使用的代码
系统 SHALL 不包含未使用的 import 和变量

#### Scenario: ESLint 检查
- **WHEN** 运行 `npx eslint src --ext .ts,.tsx`
- **THEN** 没有未使用变量的错误

### Requirement: React Hooks 依赖完整
系统 SHALL 在 useEffect 中声明所有依赖

#### Scenario: useEffect 依赖检查
- **WHEN** 使用 useEffect hook
- **THEN** 所有使用的外部变量都在依赖数组中