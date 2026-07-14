# VaultKey 项目 Bug 检查与修复 Spec

## Overview
- **Summary**: 对 VaultKey 密码管理器项目进行全面 bug 检查，发现认证流程中的异步处理问题、状态管理逻辑缺陷等关键 bug，需要系统性修复。
- **Purpose**: 修复发现的 bug，确保认证流程正确、状态管理可靠、用户体验流畅。
- **Target Users**: VaultKey 所有用户

## Goals
- 修复认证流程中的异步处理问题
- 修复解锁页面中的逻辑缺陷
- 确保状态管理方法调用正确

## Non-Goals (Out of Scope)
- 不进行新功能开发
- 不修改已验证通过的功能模块

## Background & Context
项目已完成构建和 lint 检查，但在代码审查中发现以下关键问题：

1. **Login.tsx** 中异步方法调用后立即导航，未等待认证完成
2. **Unlock.tsx** 中异步方法调用未使用 await，导致逻辑错误
3. **Unlock.tsx** 中信任设备自动解锁逻辑存在异步问题

## Functional Requirements
- **FR-1**: 认证方法（login/register/unlock）必须正确处理异步操作
- **FR-2**: 解锁页面必须正确显示剩余尝试次数并处理锁定状态
- **FR-3**: 信任设备自动解锁功能必须等待认证完成后再导航

## Non-Functional Requirements
- **NFR-1**: 所有异步操作必须使用 await 正确处理
- **NFR-2**: 认证失败时必须正确显示错误信息

## Constraints
- **Technical**: React 18 + TypeScript + Zustand 状态管理
- **Dependencies**: 仅修复现有代码，不引入新依赖

## Assumptions
- 用户已完成注册流程
- localStorage 中存在已注册的密钥数据

## Acceptance Criteria

### AC-1: Login 页面异步认证正确处理
- **Given**: 用户在 Login 页面输入正确的邮箱和密码
- **When**: 用户点击登录按钮
- **Then**: 系统等待认证完成后再导航到仪表盘，而非立即导航
- **Verification**: `programmatic`

### AC-2: Unlock 页面异步解锁正确处理
- **Given**: 用户在 Unlock 页面输入正确的密码
- **When**: 用户点击解锁按钮
- **Then**: 系统等待异步解锁完成后再导航，而非立即导航
- **Verification**: `programmatic`

### AC-3: Unlock 页面信任设备自动解锁正确处理
- **Given**: 用户设备已被标记为信任设备
- **When**: 用户访问 Unlock 页面
- **Then**: 系统等待信任设备认证完成后再导航，而非立即导航
- **Verification**: `programmatic`

### AC-4: 解锁失败时错误信息正确显示
- **Given**: 用户在 Unlock 页面输入错误密码
- **When**: 用户点击解锁按钮
- **Then**: 系统显示正确的剩余尝试次数
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无