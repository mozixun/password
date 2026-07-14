# VaultKey - 项目详情功能修复

## Overview
- **Summary**: 修复项目详情页面的两个问题：1) 添加删除项目选项；2) 在编辑登录类型项目时支持添加TOTP验证和通行证密钥
- **Purpose**: 完善项目管理功能，允许用户在编辑现有登录项目时添加TOTP和Passkey认证方式，并提供更便捷的删除操作
- **Target Users**: VaultKey 密码管理器的所有用户

## Goals
- 在项目卡片上添加删除按钮，方便快速删除项目
- 在编辑登录类型项目时添加TOTP密钥输入字段
- 在编辑登录类型项目时添加Passkey创建功能

## Non-Goals (Out of Scope)
- 不修改其他类型项目的编辑表单
- 不修改删除确认逻辑
- 不修改批量删除功能

## Background & Context
- 当前登录类型项目在编辑模式下只能编辑URL、用户名、密码和备注
- TOTP字段只在查看模式下显示，无法在编辑时添加或修改
- 没有在登录项目中添加Passkey的入口
- 删除按钮只在详情页面查看模式下存在，项目卡片上没有

## Functional Requirements
- **FR-1**: 在 ItemCard 组件中添加删除按钮，支持点击删除单个项目
- **FR-2**: 在登录类型项目的编辑表单中添加 TOTP 密钥输入字段
- **FR-3**: 在登录类型项目的编辑表单中添加 Passkey 创建按钮

## Non-Functional Requirements
- **NFR-1**: 删除操作需要确认提示
- **NFR-2**: TOTP 输入支持 Base32 编码的密钥
- **NFR-3**: Passkey 创建功能需要检查浏览器支持

## Constraints
- **Technical**: React + TypeScript，使用 Zustand 状态管理
- **Dependencies**: lucide-react 图标库

## Assumptions
- 用户已登录并有权限管理项目
- TOTP 密钥使用 Base32 编码
- Passkey 创建依赖浏览器 WebAuthn API 支持

## Acceptance Criteria

### AC-1: 项目卡片添加删除按钮
- **Given**: 用户在项目列表页面
- **When**: 鼠标悬停在项目卡片上
- **Then**: 显示删除按钮，点击后弹出确认对话框，确认后删除项目并刷新列表
- **Verification**: `human-judgment`

### AC-2: 编辑登录项目可添加TOTP
- **Given**: 用户编辑一个登录类型项目
- **When**: 在编辑表单中输入 TOTP 密钥
- **Then**: 保存后项目显示 TOTP 验证码
- **Verification**: `human-judgment`

### AC-3: 编辑登录项目可添加Passkey
- **Given**: 用户编辑一个登录类型项目且浏览器支持 Passkey
- **When**: 点击创建 Passkey 按钮并完成认证
- **Then**: Passkey 创建成功并保存到项目中
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无