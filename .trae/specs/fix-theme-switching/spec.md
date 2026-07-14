# 修复主题切换不生效 Spec

## Why
Settings 页面的主题选择（深色/浅色/跟随系统）点击后只更新了 store 状态，但没有实际应用到 DOM，导致主题切换完全不生效。根本原因是：缺少 light 主题的 CSS 变量定义、没有将 theme 状态同步到 HTML 元素的 class 属性、所有颜色值硬编码为深色主题。

## What Changes
- 在 `index.css` 中使用 CSS 变量定义 light/dark 两套颜色方案，通过 `.dark` class 切换
- 在 `tailwind.config.js` 中将 `vault` 颜色改为引用 CSS 变量
- 创建 `useThemeEffect` hook，监听 store 中 theme 值变化并同步到 `<html>` 的 class
- 在 `App.tsx` 中调用 `useThemeEffect`，使主题全局生效
- 修复 `index.css` 中 `body` 的硬编码颜色

## Impact
- Affected code: `tailwind.config.js`, `index.css`, `App.tsx`, 新增 hook 文件
- Affected specs: 所有使用 vault-* 颜色的组件均受影响（但因为是 CSS 变量映射，视觉上深色主题不变）

## ADDED Requirements

### Requirement: 主题切换实际生效
系统 SHALL 在用户选择主题后立即将对应的主题应用到页面。

#### Scenario: 用户切换到浅色主题
- **WHEN** 用户在 Settings 页面选择"浅色"主题
- **THEN** 页面背景变为浅色、文字变为深色、所有组件使用浅色调

#### Scenario: 用户切换到深色主题
- **WHEN** 用户选择"深色"主题
- **THEN** 页面恢复深色外观，与当前默认外观一致

#### Scenario: 用户选择跟随系统
- **WHEN** 用户选择"跟随系统"主题
- **THEN** 页面根据操作系统当前偏好自动应用深色或浅色主题
- **AND** 当系统偏好变化时自动切换

#### Scenario: 页面刷新后主题保持
- **WHEN** 用户刷新页面
- **THEN** 之前选择的主题仍然生效
