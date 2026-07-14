# Tasks

## P0 关键功能性 Bug 修复
- [x] Task 1: 修复自动锁定机制
  - [x] SubTask 1.1: 在 App.tsx 中添加 useEffect，定时调用 `checkAutoLock`
  - [x] SubTask 1.2: 验证自动锁定在闲置超时后生效
- [x] Task 2: 修复活动计时器重置
  - [x] SubTask 2.1: 在 AppLayout.tsx 中绑定用户活动事件（click、keydown、scroll、mousemove）
  - [x] SubTask 2.2: 事件触发时调用 `resetActivityTimer`
  - [x] SubTask 2.3: 验证用户活动后计时器正确重置
- [x] Task 3: 修复使用统计更新
  - [x] SubTask 3.1: 在 CopyButton.tsx 复制成功后调用 `incrementUsage`
  - [x] SubTask 3.2: 在 ItemCard.tsx 复制密码成功后调用 `incrementUsage`
  - [x] SubTask 3.3: 在 ItemDetail.tsx 打开时调用 `incrementUsage`
  - [x] SubTask 3.4: 验证复制/查看后使用计数正确增加

## P1 错误处理与健壮性
- [x] Task 4: 修复 store 中空 catch 块
  - [x] SubTask 4.1: 为 localStorage setItem/removeItem 的 catch 块添加 console.warn 日志
  - [x] SubTask 4.2: 为 JSON.parse 的 catch 块添加回退处理
  - [x] SubTask 4.3: 验证无空 catch 块剩余
- [x] Task 5: 修复 clipboard.ts 未使用变量
  - [x] SubTask 5.1: 分析 `lastCopiedValue` 是否需要保留，如无实际用途则移除
  - [x] SubTask 5.2: 移除不必要的 eslint-disable 注释

## P2 代码质量
- [x] Task 6: 移除生产代码中的 console.error
  - [x] SubTask 6.1: 替换 ItemDetail.tsx 中的 console.error 为 alert 或静默处理
  - [x] SubTask 6.2: 替换 Watchtower.tsx 中的 console.error 为静默处理

## P3 构建验证
- [x] Task 7: 验证修复后构建成功
  - [x] SubTask 7.1: `npm run build` 零错误通过
  - [x] SubTask 7.2: `npm run lint` 零错误零警告通过

# Task Dependencies
- [Task 7] depends on [Task 1, Task 2, Task 3, Task 4, Task 5, Task 6]
