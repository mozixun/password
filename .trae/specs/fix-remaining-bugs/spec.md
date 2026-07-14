# 系统完善与 Bug 修复 Spec

## Why
在完成 VaultKey 密码管理器的核心功能开发后，通过系统性代码审查发现了多处功能性 Bug：store 中定义的关键方法从未被调用、自动锁定机制失效、使用统计不更新等。这些问题严重影响用户体验和数据安全，需要立即修复。

## What Changes

### P0 关键功能性 Bug 修复
- **修复自动锁定机制失效**：`checkAutoLock` 在 store 中定义但从未在 App 中被定时调用，导致闲置超时自动锁定完全不工作
- **修复活动计时器未重置**：`resetActivityTimer` 在 store 中定义但从未在用户活动时调用，导致计时器一直基于登录时间而非最后活动时间
- **修复使用统计不更新**：`incrementUsage` 在 store 中定义但复制/查看密码时从未调用，导致"最近使用"排序和统计不准确

### P1 错误处理与健壮性
- **修复空 catch 块**：store 中多个 localStorage 操作的 catch 块为空，静默吞掉错误导致调试困难
- **修复 clipboard.ts 中未使用变量**：`lastCopiedValue` 被标记为未使用但实际有赋值，且 eslint-disable 注释掩盖了真实问题

### P2 代码质量
- **移除生产代码中的 console.error**：ItemDetail.tsx 和 Watchtower.tsx 中的 console.error 应替换为更优雅的错误处理

## Impact
- 受影响代码：
  - `src/App.tsx` - 添加自动锁定定时检查
  - `src/components/AppLayout.tsx` - 绑定用户活动事件重置计时器
  - `src/components/CopyButton.tsx` - 复制后调用 incrementUsage
  - `src/components/ItemCard.tsx` - 复制密码后调用 incrementUsage
  - `src/pages/ItemDetail.tsx` - 查看详情后调用 incrementUsage，移除 console.error
  - `src/pages/Watchtower.tsx` - 移除 console.error
  - `src/store/index.ts` - 为空 catch 块添加有意义的错误处理
  - `src/utils/clipboard.ts` - 修复未使用变量问题

## ADDED Requirements

### Requirement: 自动锁定机制
系统 SHALL 在用户闲置超过设定时间后自动锁定保险库。

#### Scenario: 闲置超时自动锁定
- **WHEN** 用户在 `autoLockMinutes` 时间内无任何操作
- **THEN** 应用自动锁定，跳转到解锁页

#### Scenario: 用户活动时重置计时器
- **WHEN** 用户在受保护页面中进行任何交互（点击、输入、滚动等）
- **THEN** 重置 `lastActivityTime` 为当前时间

### Requirement: 使用统计自动更新
系统 SHALL 在用户复制或查看密码时自动更新项目使用统计。

#### Scenario: 复制密码
- **WHEN** 用户点击复制按钮复制密码或用户名
- **THEN** 调用 `incrementUsage` 更新该项目的 `usageCount` 和 `lastUsedAt`

#### Scenario: 查看项目详情
- **WHEN** 用户打开项目详情页
- **THEN** 调用 `incrementUsage` 更新该项目的 `usageCount` 和 `lastUsedAt`

## MODIFIED Requirements

### Requirement: localStorage 错误处理
localStorage 操作失败时 SHALL 至少记录错误信息，不再静默忽略。

## REMOVED Requirements
无

## 不在范围内
- 功能新增（如导出导入格式扩展等）
- UI 样式调整
- 性能优化
