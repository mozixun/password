# 完善 PRD 核心功能

## Why
PRD 文档中定义了多项核心功能尚未实现，包括个人资料页、账户恢复、项目共享、生物识别入口和泄露监控对接，这些是密码管理器的关键功能。

## What Changes
- 新增个人资料页面（Profile.tsx）
- 实现账户恢复功能（恢复密钥重置主密码）
- 添加项目共享设置功能
- 添加生物识别快捷入口提示
- 完善 Have I Been Pwned API 对接

## Impact
- Affected files:
  - `/workspace/src/pages/Profile.tsx` (新建)
  - `/workspace/src/pages/Settings.tsx` (修改)
  - `/workspace/src/pages/ItemDetail.tsx` (修改)
  - `/workspace/src/pages/Login.tsx` (修改)
  - `/workspace/src/pages/Watchtower.tsx` (修改)
  - `/workspace/src/components/Sidebar.tsx` (修改)
  - `/workspace/src/App.tsx` (修改)
  - `/workspace/src/utils/breachDetection.ts` (修改)

## ADDED Requirements

### Requirement: 个人资料页
系统 SHALL 提供个人资料页面，展示用户账户信息和管理活跃设备

#### Scenario: 查看个人资料
- **WHEN** 用户点击侧边栏个人资料入口
- **THEN** 显示个人资料页面，包含头像、邮箱、注册日期、订阅状态

#### Scenario: 管理活跃设备
- **WHEN** 用户查看活跃设备列表
- **THEN** 显示所有已登录设备，支持远程注销

### Requirement: 账户恢复功能
系统 SHALL 支持通过恢复密钥重置主密码

#### Scenario: 使用恢复密钥重置
- **WHEN** 用户忘记主密码，点击"忘记主密码"链接
- **THEN** 显示恢复密钥输入界面，验证成功后允许设置新主密码

### Requirement: 项目共享设置
系统 SHALL 支持将项目共享给家庭成员或团队成员

#### Scenario: 共享项目
- **WHEN** 用户在项目详情页点击共享设置
- **THEN** 显示共享面板，可选择共享对象和权限

### Requirement: 生物识别入口
系统 SHALL 提供生物识别快捷解锁入口

#### Scenario: 显示生物识别提示
- **WHEN** 用户在登录/解锁页
- **THEN** 根据设备类型显示 Touch ID/Face ID/Windows Hello 提示

### Requirement: Have I Been Pwned API 对接
系统 SHALL 与 Have I Been Pwned API 对接检查密码泄露

#### Scenario: 检查密码泄露
- **WHEN** 用户打开安全中心
- **THEN** 调用 HIBP API 检查密码是否泄露并显示结果