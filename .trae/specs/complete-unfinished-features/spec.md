# VaultKey 未完善功能 - 产品需求文档

## Overview
- **Summary**: 完善 VaultKey 密码管理器中尚未实现的 PRD 功能，包括记住设备、附件管理、密码历史回滚、项目共享、保管库共享、语言切换和右键菜单。
- **Purpose**: 确保产品功能完整性，提升用户体验和产品竞争力。
- **Target Users**: 所有 VaultKey 用户

## Goals
- 实现登录页"记住设备"功能
- 实现项目详情页附件管理功能
- 实现密码历史回滚功能
- 实现项目共享设置功能
- 实现保管库共享功能
- 实现语言切换功能
- 实现项目列表右键菜单

## Non-Goals (Out of Scope)
- 浏览器插件功能
- iPhone/Mac 客户端开发
- 后端 API 对接（保持模拟数据）
- 支付订阅系统

## Background & Context
- 项目采用 React + TypeScript + Vite 构建
- 使用 Zustand 进行状态管理
- 使用 Lucide React 图标库
- Tailwind CSS 进行样式管理

## Functional Requirements
- **FR-1**: 用户登录时可选择"记住设备"，信任设备后下次登录可跳过主密码验证
- **FR-2**: 项目详情页支持上传、下载、删除附件文件
- **FR-3**: 密码历史记录支持回滚到历史版本
- **FR-4**: 项目可与其他用户共享，支持查看/编辑权限设置
- **FR-5**: 保管库可与其他用户共享，支持成员管理和权限设置
- **FR-6**: 支持中文/英文/日文语言切换
- **FR-7**: 项目列表支持右键菜单操作（打开、复制密码、删除等）

## Non-Functional Requirements
- **NFR-1**: 所有功能需响应式设计，支持桌面端和移动端
- **NFR-2**: 附件大小限制在 10MB 以内
- **NFR-3**: 语言切换即时生效，无需刷新页面

## Constraints
- **Technical**: 仅前端实现，使用 localStorage 存储持久化数据
- **Dependencies**: 现有组件库和状态管理模式

## Assumptions
- 用户数据使用模拟数据，无需后端支持
- 语言切换仅影响 UI 文本，不影响数据存储格式

## Acceptance Criteria

### AC-1: 记住设备功能
- **Given**: 用户在登录页面
- **When**: 用户勾选"记住设备"并成功登录
- **Then**: 设备被标记为受信，下次登录时跳过主密码验证
- **Verification**: `programmatic`

### AC-2: 附件管理功能
- **Given**: 用户在项目详情页编辑模式
- **When**: 用户上传附件文件
- **Then**: 附件被保存并显示在详情页，支持下载和删除
- **Verification**: `programmatic`

### AC-3: 密码历史回滚
- **Given**: 项目有密码修改历史
- **When**: 用户点击历史记录的"使用"按钮
- **Then**: 当前密码被替换为历史密码，历史记录更新
- **Verification**: `programmatic`

### AC-4: 项目共享
- **Given**: 用户在项目详情页
- **When**: 用户点击共享按钮并输入共享邮箱和权限
- **Then**: 项目显示已共享状态，共享列表更新
- **Verification**: `human-judgment`

### AC-5: 保管库共享
- **Given**: 用户在保管库管理页
- **When**: 用户点击共享按钮并邀请成员
- **Then**: 保管库显示共享成员列表，支持权限管理
- **Verification**: `human-judgment`

### AC-6: 语言切换
- **Given**: 用户在设置页语言设置
- **When**: 用户选择不同语言
- **Then**: 界面文本立即切换为对应语言
- **Verification**: `human-judgment`

### AC-7: 右键菜单
- **Given**: 用户在项目列表页
- **When**: 用户右键点击项目卡片
- **Then**: 弹出上下文菜单，包含常用操作选项
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持批量共享项目？
- [ ] 附件是否需要加密存储？