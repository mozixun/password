# 修复点击项目跳转错误 Spec

## Why
用户点击任何项目卡片或列表项时，期望跳转到项目详情页，但实际跳转到了「所有项目」页面。根本原因是路由匹配顺序错误和导航路径不一致。

## What Changes
- 调整 `App.tsx` 中路由顺序：将具体路由（`/items/detail/:id`、`/items/new`）移到动态路由（`/items/:type`）之前
- 修改 `ItemCard.tsx` 中的导航路径从 `/items/${item.id}` 改为 `/items/detail/${item.id}`
- 修改 `Items.tsx` 列表视图中的导航路径从 `/items/${item.id}` 改为 `/items/detail/${item.id}`

## Impact
- Affected code: `App.tsx`, `ItemCard.tsx`, `Items.tsx`
- 修复后点击项目会正确跳转到详情页

## ADDED Requirements

### Requirement: 点击项目跳转到详情页
系统 SHALL 在用户点击项目卡片或列表项后导航到项目详情页面。

#### Scenario: 点击项目卡片
- **WHEN** 用户在网格视图中点击项目卡片
- **THEN** 页面导航到 `/items/detail/{项目ID}`，显示项目详情

#### Scenario: 点击列表项
- **WHEN** 用户在列表视图中点击项目条目
- **THEN** 页面导航到 `/items/detail/{项目ID}`，显示项目详情

#### Scenario: 类型筛选仍正常工作
- **WHEN** 用户点击类型筛选标签（如「登录」、「笔记」）
- **THEN** 页面导航到 `/items/logins` 等类型路径，显示筛选后的列表

## Constraints
- 保持现有 URL 结构不变（`/items/detail/:id` 保持不变）
