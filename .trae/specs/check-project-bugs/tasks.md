# VaultKey Bug 修复 - 实施计划

## [x] Task 1: 修复 Login.tsx 异步认证处理
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将 `handleLogin` 和 `handleRegister` 改为 async 函数
  - 在调用 `auth.login` 和 `auth.register` 时添加 await
  - 等待认证成功后再执行 navigate
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: Login 页面登录成功后正确导航到 dashboard
  - `programmatic` TR-1.2: Login 页面注册成功后正确导航到 dashboard
  - `human-judgment` TR-1.3: 认证失败时停留在登录页面并显示错误信息

## [x] Task 2: 修复 Unlock.tsx 异步解锁处理
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 将 `handleUnlock` 改为 async 函数
  - 在调用 `auth.unlock` 时添加 await
  - 根据 await 返回的布尔值决定是否导航
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-2.1: Unlock 页面解锁成功后正确导航到 dashboard
  - `programmatic` TR-2.2: Unlock 页面解锁失败时显示正确的剩余尝试次数
  - `human-judgment` TR-2.3: 账户锁定时显示正确的错误提示

## [x] Task 3: 修复 Unlock.tsx 信任设备自动解锁
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 在信任设备自动解锁逻辑中，等待 `auth.unlockWithTrustedDevice()` 完成
  - 只有在认证成功后才导航到 dashboard
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 信任设备认证成功后正确导航到 dashboard
  - `programmatic` TR-3.2: 信任设备认证失败时停留在 unlock 页面
  - `human-judgment` TR-3.3: 自动解锁过程中有适当的加载状态

## [x] Task 4: 构建验证
- **Priority**: high
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 运行 `npm run build` 确保构建通过
  - 运行 `npm run lint` 确保无 lint 错误
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: `npm run build` 零错误通过
  - `programmatic` TR-4.2: `npm run lint` 零错误零警告

# Task Dependencies
- [Task 4] depends on [Task 1, Task 2, Task 3]