# 苹果风毛玻璃UI重新设计 Spec

## Why
当前 UI 虽然功能完整，但视觉风格偏传统卡片+边框设计，缺少苹果 macOS Sonoma / iOS 17 的通透质感。需要重新设计一套毛玻璃（Liquid Glass）风格的 UI，保留紫色主色调，全面提升视觉品质。

## What Changes
- 重新设计配色变量：引入多层透明度表面系统，支持毛玻璃层叠
- 重新设计组件样式层（`.vault-card`、`.vault-btn-primary` 等）：大面积使用 `backdrop-blur-xl` + 半透明背景
- 重新设计侧边栏：毛玻璃半透明侧边栏，导航项使用药丸形圆角和滑动指示器
- 重新设计顶部栏：增强毛玻璃模糊效果，增加底部细线渐变
- 重新设计登录页：移除旧的 mesh 浮球，改用苹果风渐变光晕背景
- 新增动画效果：毛玻璃展开、弹性缩放、光晕流动等
- 新增组件样式：`.glass-panel`、`.glass-nav-item`、`.glass-input`

## Impact
- Affected code: `src/index.css`, `tailwind.config.js`, `src/components/AppLayout.tsx`, `src/components/Sidebar.tsx`, `src/pages/Login.tsx`
- 所有页面自动继承新的毛玻璃风格，无需逐页修改

## ADDED Requirements

### Requirement: 毛玻璃表面系统
系统 SHALL 提供多层透明度表面系统，支持毛玻璃层叠效果。

#### Scenario: 表面层级
- **WHEN** 页面渲染卡片、面板、弹窗
- **THEN** 使用半透明背景（如 surface 70%透明）+ `backdrop-blur-xl` + 细边框（1px 半透明白/黑）

### Requirement: 毛玻璃侧边栏
系统 SHALL 渲染半透明毛玻璃侧边栏，背景模糊穿透底层内容。

#### Scenario: 侧边栏毛玻璃
- **WHEN** 用户查看侧边栏
- **THEN** 侧边栏背景为半透明 + `backdrop-blur-2xl`，导航项使用药丸形 `rounded-xl` 圆角

### Requirement: 毛玻璃顶部栏
系统 SHALL 渲染毛玻璃顶部栏，底部边框使用渐变线。

#### Scenario: 顶部栏毛玻璃
- **WHEN** 用户滚动页面内容
- **THEN** 顶部栏保持毛玻璃模糊效果，底部边框为渐变透明线

### Requirement: 登录页光晕背景
系统 SHALL 在登录页渲染紫色光晕渐变背景，替代旧的 mesh 浮球动画。

#### Scenario: 光晕背景
- **WHEN** 用户访问登录页
- **THEN** 背景显示 2-3 个紫色径向渐变光晕，带柔和浮动动画

### Requirement: 新增动画
系统 SHALL 提供毛玻璃风格专属动画效果。

#### Scenario: 玻璃展开动画
- **WHEN** 弹窗或面板出现
- **THEN** 以缩放+模糊渐入效果出现

#### Scenario: 弹性回弹
- **WHEN** 用户点击按钮
- **THEN** 按钮产生弹性回弹缩放效果

## MODIFIED Requirements

### Requirement: CSS 变量配色
Light 主题调整 surface 和 card 为半透明值，新增 glass 变量：
- `--vault-surface`: 255 255 255（保持，但使用时配合透明度）
- `--vault-glass`: 255 255 255（新增，用于毛玻璃面板背景）
- `--vault-glass-border`: 255 255 255（新增，毛玻璃边框色）
- `--vault-bg`: 245 245 250（微调为更暖的灰白底）

Dark 主题调整：
- `--vault-surface`: 20 25 45（微调偏紫的深色）
- `--vault-card`: 25 30 55
- `--vault-glass`: 30 35 60（新增）
- `--vault-glass-border`: 255 255 255（新增，毛玻璃边框用白色低透明度）
- `--vault-bg`: 8 10 20（更深更紫的底色）

### Requirement: 组件样式层
- `.vault-card`: 改为 `bg-vault-card/60 backdrop-blur-xl border border-vault-border/50`，hover 增强阴影和上浮
- `.vault-btn-primary`: 保留渐变但增加 `backdrop-blur-sm`，hover 增加光晕扩散
- `.vault-input`: 改为 `bg-vault-surface/50 backdrop-blur-sm`，聚焦时 ring 增强
- `.sidebar-item`: 改为 `rounded-xl`，active 态使用 `bg-vault-accent/15 backdrop-blur-sm`
- 新增 `.glass-panel`: `bg-vault-glass/10 backdrop-blur-2xl border border-vault-glass-border/20 rounded-2xl`
- 新增 `.glass-nav-item`: 药丸形导航项，hover/active 使用毛玻璃背景

## Constraints
- 保留 `darkMode: "class"` 机制不变
- 保留紫色主色调（#7C3AED / #A78BFA）
- 保留 `vault-*` CSS 变量命名结构
- 保留所有页面 TSX 中的 Tailwind 类名兼容性（新增类不破坏旧类）
- 保留 `lucide-react` 图标库
