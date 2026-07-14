# VaultKey 管理员设置页面 - 产品需求文档

## Overview
- **Summary**: 添加一个管理员设置页面，允许管理员控制网站信息（名称、Logo、描述）和配置网站域名（允许列表、阻止列表、自动填充域名匹配规则）等全局配置。
- **Purpose**: 为密码管理器提供全局配置管理能力，使管理员能够自定义品牌信息和控制域名相关的安全策略。
- **Target Users**: 系统管理员（当前用户即为管理员）

## Goals
- 创建管理员设置页面，包含网站信息配置和域名配置两个主要模块
- 实现网站名称、Logo、描述等品牌信息的编辑和保存
- 实现域名允许列表、阻止列表的管理
- 实现自动填充域名匹配规则的配置
- 确保配置变更实时生效并持久化存储

## Non-Goals (Out of Scope)
- 用户权限管理（非管理员用户无法访问）
- 多租户支持
- 高级域名规则（如正则表达式匹配）
- SSL/TLS 证书管理

## Background & Context
- 当前系统已有个人设置页面（Settings.tsx），但缺少全局管理员配置功能
- 用户可能需要自定义品牌信息以符合企业需求
- 域名配置对于密码管理器的自动填充安全至关重要

## Functional Requirements
- **FR-1**: 管理员可以查看和编辑网站基本信息（名称、Logo URL、描述）
- **FR-2**: 管理员可以管理域名允许列表（添加、删除域名）
- **FR-3**: 管理员可以管理域名阻止列表（添加、删除域名）
- **FR-4**: 管理员可以配置自动填充域名匹配规则（精确匹配/模糊匹配）
- **FR-5**: 所有配置变更实时保存到 store 并在页面刷新后保持

## Non-Functional Requirements
- **NFR-1**: 页面使用与现有 Settings 页面一致的设计风格
- **NFR-2**: 域名列表支持搜索和分页（当前实现简单列表）
- **NFR-3**: 配置变更有视觉反馈（保存成功/失败提示）

## Constraints
- **Technical**: React 18 + TypeScript + Tailwind CSS + Zustand
- **Dependencies**: 依赖现有 store 结构和类型定义

## Assumptions
- 当前用户即为管理员，无需额外权限验证
- Logo 通过 URL 配置（不支持文件上传）

## Acceptance Criteria

### AC-1: 管理员页面路由可访问
- **Given**: 用户已登录且未锁定
- **When**: 用户导航到 /admin 路径
- **Then**: 显示管理员设置页面
- **Verification**: `programmatic`

### AC-2: 网站信息配置表单
- **Given**: 管理员页面已加载
- **When**: 用户编辑网站名称、Logo、描述并点击保存
- **Then**: 配置保存成功并显示成功提示
- **Verification**: `programmatic`

### AC-3: 域名允许列表管理
- **Given**: 管理员页面已加载
- **When**: 用户添加/删除允许列表中的域名
- **Then**: 列表实时更新并保存
- **Verification**: `programmatic`

### AC-4: 域名阻止列表管理
- **Given**: 管理员页面已加载
- **When**: 用户添加/删除阻止列表中的域名
- **Then**: 列表实时更新并保存
- **Verification**: `programmatic`

### AC-5: 自动填充规则配置
- **Given**: 管理员页面已加载
- **When**: 用户切换精确/模糊匹配模式
- **Then**: 配置保存并显示当前模式
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要区分超级管理员和普通管理员权限？
- [ ] Logo 是否需要支持文件上传还是仅 URL？（当前假设仅 URL）
