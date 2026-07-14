# 紫色配色与动态效果重新设计 Spec

## Why
当前 UI 使用青绿色（teal）作为主色调，需要切换为紫色配色以提升视觉品质。同时现有动画效果较为基础，需要重新设计一套更丰富的动态效果体系。

## What Changes
- 将 Light 主题和 Dark 主题的 accent 系列颜色从青绿色改为紫色
- 调整辅助色（blue、purple、char 系列）以协调紫色主调
- 调整渐变按钮和发光效果的颜色为紫色
- 重新设计 tailwind.config.js 中的动画关键帧，增加更丰富的动态效果
- 更新 index.css 中的组件样式过渡效果
- 更新 pulseGlow 动画的硬编码 rgba 颜色为紫色

## Impact
- Affected code: `src/index.css`, `tailwind.config.js`
- 所有使用 `vault-accent` 颜色的组件将自动跟随变色
- 所有使用 `animate-*` 类的页面将获得新的动画效果

## ADDED Requirements

### Requirement: 紫色主色调
系统 SHALL 使用紫色作为 UI 主色调（accent），在 Light 和 Dark 主题下分别使用协调的紫色变体。

#### Scenario: Light 主题紫色配色
- **WHEN** 主题设置为 light
- **THEN** accent 颜色为紫色（如 #7C3AED / 124 58 237），accent-hover 和 accent-dim 使用同色系明暗变体

#### Scenario: Dark 主题紫色配色
- **WHEN** 主题设置为 dark
- **THEN** accent 颜色为亮紫色（如 #A78BFA / 167 139 250），在深色背景上有足够对比度

### Requirement: 动态效果体系
系统 SHALL 提供一套完整的动态效果体系，包含页面进入、元素交互和持续动画。

#### Scenario: 页面进入动画
- **WHEN** 用户导航到新页面
- **THEN** 页面内容以平滑的淡入+上移效果出现

#### Scenario: 卡片悬停动画
- **WHEN** 用户悬停在卡片上
- **THEN** 卡片产生轻微上浮和紫色边框发光效果

#### Scenario: 按钮交互动画
- **WHEN** 用户点击主按钮
- **THEN** 按钮产生缩放反馈和紫色阴影扩散

#### Scenario: 持续脉动动画
- **WHEN** 页面包含需要持续吸引注意的元素（如安全评分、验证码）
- **THEN** 元素产生紫色脉动发光效果

## MODIFIED Requirements

### Requirement: CSS 变量配色
Light 主题 `:root` 中 accent 系列变量改为紫色系：
- `--vault-accent`: 124 58 237（#7C3AED）
- `--vault-accent-hover`: 139 92 246（#8B5CF6）
- `--vault-accent-dim`: 109 40 217（#6D28D9）
- `--vault-char-lower`: 124 58 237

Dark 主题 `.dark` 中 accent 系列变量改为紫色系：
- `--vault-accent`: 167 139 250（#A78BFA）
- `--vault-accent-hover`: 196 181 253（#C4B5FD）
- `--vault-accent-dim`: 139 92 246（#8B5CF6）
- `--vault-char-lower`: 167 139 250
- `--vault-success`: 167 139 250

### Requirement: 动画关键帧
`tailwind.config.js` 中的 keyframes 全部更新：
- `pulseGlow` 的 boxShadow rgba 改为紫色 `(167, 139, 250, ...)`
- 新增 `shimmer` 闪光动画
- 新增 `scale-in` 缩放进入动画
- 新增 `bounce-subtle` 轻微弹跳动画
- 优化现有 fadeIn、slideUp、slideInLeft 的缓动曲线

## Constraints
- 保留现有 CSS 变量命名结构，只改变值
- 保留 `darkMode: "class"` 机制不变
- 保留 `<alpha-value>` 语法（已移除的不再加回）
- 不修改任何组件 TSX 文件中的类名
