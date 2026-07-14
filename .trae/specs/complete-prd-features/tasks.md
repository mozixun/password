# Tasks

- [x] Task 1: 创建个人资料页面 Profile.tsx
  - [x] SubTask 1.1: 创建 Profile.tsx 页面组件，包含头像、账户信息、订阅状态展示
  - [x] SubTask 1.2: 添加活跃设备列表组件，支持远程注销功能
  - [x] SubTask 1.3: 在 App.tsx 添加路由 /profile
  - [x] SubTask 1.4: 在 Sidebar.tsx 添加个人资料入口

- [x] Task 2: 实现账户恢复功能
  - [x] SubTask 2.1: 在 Login.tsx 添加"忘记主密码"链接和恢复密钥输入界面
  - [x] SubTask 2.2: 实现恢复密钥验证逻辑
  - [x] SubTask 2.3: 实现重置主密码功能

- [x] Task 3: 添加项目共享设置功能
  - [x] SubTask 3.1: 在 ItemDetail.tsx 添加共享设置面板组件
  - [x] SubTask 3.2: 实现共享对象选择和权限管理界面
  - [x] SubTask 3.3: 添加共享状态显示

- [x] Task 5: 完善 Have I Been Pwned API 对接
  - [x] SubTask 5.1: 优化 breachDetection.ts 中的 HIBP API 调用
  - [x] SubTask 5.2: 在 Watchtower.tsx 中集成泄露检测结果展示

- [x] Task 6: 验证和测试
  - [x] SubTask 6.1: 构建验证 npm run build 成功
  - [x] SubTask 6.2: ESLint 检查无新增错误

# Task Dependencies
- [Task 6] depends on [Task 1, Task 2, Task 3, Task 4, Task 5]
- [Task 3] depends on [] (可并行)
- [Task 4] depends on [] (可并行)
- [Task 5] depends on [] (可并行)