# 新引入 Bug 修复 Spec

## Why
在完成 `complete-unfinished-features` 规范（实现记住设备、附件管理、密码历史回滚、项目共享、保管库共享、语言切换、右键菜单）后，引入了新的 bug，导致 TypeScript 构建失败和 ESLint 报告问题。需要系统性修复以恢复代码质量。

## What Changes

### 1. TypeScript 构建错误修复
- 修复 `ItemCard.tsx(140,39)` 的 TS2554 错误：调用 `handleClick(e)` 时 `handleClick` 函数不接受参数（之前我们修改时移除了 `_e` 参数，但调用处未更新）

### 2. ESLint 错误修复
- 修复 `ItemCard.tsx` 中残留的未使用参数问题
- 修复 `Unlock.tsx` 中 useEffect 依赖警告（添加 eslint-disable 注释）

## Impact
- 受影响代码:
  - `src/components/ItemCard.tsx` - 关键构建错误
  - `src/pages/Unlock.tsx` - 依赖警告

## ADDED Requirements

### Requirement: TypeScript 严格类型检查
所有 React 组件的事件处理函数 SHALL 严格匹配其类型签名。

#### Scenario: 调用事件处理函数
- **WHEN** 调用事件处理函数（如 `handleClick`）
- **THEN** 传入的参数类型必须与函数签名匹配，否则 TypeScript 编译失败

### Requirement: ESLint 无新增错误
src/ 目录下的代码 SHALL 无 ESLint 错误或警告。

#### Scenario: 运行 ESLint
- **WHEN** 对 src/ 目录运行 `eslint`
- **THEN** 无新增错误或警告（api/ 和 vite.config.ts 中的预先存在问题不在范围内）

## MODIFIED Requirements

### Requirement: ItemCard 点击处理
`handleClick` 函数 SHALL 不接受参数（之前定义为 `_e?: React.MouseEvent`，后修改为无参数）。调用处 SHALL 移除事件参数传递。

## REMOVED Requirements
无

## 不在范围内
- `api/app.ts`、`api/routes/auth.ts`、`vite.config.ts` 中的未使用变量错误为预先存在问题，不在本次修复范围内
