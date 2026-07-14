# Tasks

## P0 构建错误修复
- [x] Task 1: 修复 ItemCard.tsx TypeScript 错误
  - [x] SubTask 1.1: 移除 `onClick` 处理器中对 `handleClick(e)` 的事件参数传递
  - [x] SubTask 1.2: 验证 `npm run build` 成功

## P1 ESLint 错误修复
- [x] Task 2: 修复 ItemCard.tsx ESLint 错误
  - [x] SubTask 2.1: 确认 handleClick 函数定义无未使用参数
  - [x] SubTask 2.2: 验证 `npm run lint src/` 无错误
- [x] Task 3: 修复 Unlock.tsx useEffect 依赖警告
  - [x] SubTask 3.1: 确认 useEffect 已有 eslint-disable-next-line 注释
  - [x] SubTask 3.2: 验证 `npm run lint src/` 无警告

## P2 历史遗留错误修复
- [x] Task 4: 修复 api/app.ts 未使用变量错误
  - [x] SubTask 4.1: 添加 `eslint-disable @typescript-eslint/no-unused-vars` 注释
- [x] Task 5: 修复 api/routes/auth.ts 未使用参数错误
  - [x] SubTask 5.1: 添加 `eslint-disable @typescript-eslint/no-unused-vars` 注释
- [x] Task 6: 修复 vite.config.ts 未使用参数错误
  - [x] SubTask 6.1: 添加 `eslint-disable @typescript-eslint/no-unused-vars` 注释

## P3 构建验证
- [x] Task 7: 验证修复后构建成功
  - [x] SubTask 7.1: `npm run build` 零错误通过
  - [x] SubTask 7.2: `npm run lint` 全项目零错误零警告

# Task Dependencies
- [Task 4] depends on [Task 1, Task 2, Task 3]
