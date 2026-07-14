# VaultKey 管理员设置页面 - 实现计划

## [x] Task 1: 创建 AdminSettings 类型定义
- **Priority**: high
- **Depends On**: None
- **Description**: 在 types/index.ts 中添加 AdminSettings 类型定义，包含网站信息和域名配置字段
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3, FR-4, FR-5
- **Test Requirements**:
  - `programmatic` TR-1.1: AdminSettings 类型包含 siteInfo 和 domainConfig 字段
  - `programmatic` TR-1.2: siteInfo 包含 name、logoUrl、description 字段
  - `programmatic` TR-1.3: domainConfig 包含 allowedDomains、blockedDomains、matchMode 字段

## [x] Task 2: 在 store 中添加 adminSettings 切片
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 在 store/index.ts 中添加 adminSettings 切片，包含状态和操作方法（updateSiteInfo、addAllowedDomain、removeAllowedDomain、addBlockedDomain、removeBlockedDomain、setMatchMode）
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3, FR-4, FR-5
- **Test Requirements**:
  - `programmatic` TR-2.1: adminSettings 切片包含初始 mock 数据
  - `programmatic` TR-2.2: 所有操作方法正确更新状态
  - `programmatic` TR-2.3: AdminState 接口完整定义

## [x] Task 3: 创建 AdminSettings 页面组件
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 创建 src/pages/AdminSettings.tsx 页面，包含网站信息配置和域名配置两个模块
- **Acceptance Criteria Addressed**: FR-1, FR-2, FR-3, FR-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 页面使用与 Settings 一致的设计风格
  - `programmatic` TR-3.2: 网站信息表单包含名称、Logo URL、描述输入框
  - `programmatic` TR-3.3: 域名允许/阻止列表支持添加和删除
  - `programmatic` TR-3.4: 自动填充规则包含精确/模糊匹配切换

## [x] Task 4: 添加路由和导航入口
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 在 App.tsx 中添加 /admin 路由，在 Sidebar 中添加管理员页面导航入口
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-4.1: /admin 路由正确注册并使用 ProtectedRoute 保护
  - `human-judgment` TR-4.2: Sidebar 中显示管理员设置导航项

## [x] Task 5: 构建验证
- **Priority**: medium
- **Depends On**: All previous tasks
- **Description**: 运行 npm run build 确保零错误通过
- **Acceptance Criteria Addressed**: 所有
- **Test Requirements**:
  - `programmatic` TR-5.1: npm run build 零错误通过
