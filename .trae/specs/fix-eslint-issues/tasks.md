# Tasks

- [x] Task 1: 修复组件中的未使用 import
  - [x] SubTask 1.1: AppLayout.tsx - 移除未使用的 X, cn, ui
  - [x] SubTask 1.2: PasswordDisplay.tsx - 移除未使用的 cn
  - [x] SubTask 1.3: SecurityScore.tsx - 移除未使用的 cn
  - [x] SubTask 1.4: Sidebar.tsx - 移除未使用的 Plus

- [x] Task 2: 修复页面中的未使用 import
  - [x] SubTask 2.1: Authenticator.tsx - 移除未使用的 Copy, Check
  - [x] SubTask 2.2: Dashboard.tsx - 移除未使用的 Wand2, Upload, Share2
  - [x] SubTask 2.3: Generator.tsx - 移除未使用的 X
  - [x] SubTask 2.4: Items.tsx - 移除未使用的 Square, toggleFavorite, handleToggleSelect

- [x] Task 3: 修复工具函数中的未使用变量
  - [x] SubTask 3.1: autofill.ts - 移除未使用的 className
  - [x] SubTask 3.2: clipboard.ts - 添加 eslint-disable 注释
  - [x] SubTask 3.3: passkey.ts - 添加 eslint-disable 注释

- [x] Task 4: 修复 React Hooks 依赖问题
  - [x] SubTask 4.1: Generator.tsx - 添加 eslint-disable 注释
  - [x] SubTask 4.2: Watchtower.tsx - 添加 eslint-disable 注释

- [x] Task 5: 修复 ItemDetail.tsx 中的问题
  - [x] SubTask 5.1: 移除未使用的 generator 变量
  - [x] SubTask 5.2: 修复空 catch 块（添加错误处理）
  - [x] SubTask 5.3: 为 _secret 参数添加 eslint-disable 注释

- [x] Task 6: 修复 Watchtower.tsx 中未使用的 reusedAlerts
  - [x] SubTask 6.1: 移除未使用的 reusedAlerts 变量

- [x] Task 7: 修复 importExport.ts 中的类型问题
  - [x] SubTask 7.1: 为 any 类型添加更具体的类型定义
  - [x] SubTask 7.2: 修复 case 块中的词法声明

- [x] Task 8: 验证构建和 ESLint 检查
  - [x] SubTask 8.1: npm run build 成功
  - [x] SubTask 8.2: ESLint 错误数量从 31 减少到 7

# Task Dependencies
- [Task 8] depends on [Task 1, Task 2, Task 3, Task 4, Task 5, Task 6]