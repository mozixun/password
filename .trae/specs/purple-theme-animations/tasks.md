# Tasks

- [x] Task 1: 修改 index.css 配色变量为紫色
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 
    - Light 主题 `:root` 中 accent 系列改为紫色：`--vault-accent: 124 58 237`，`--vault-accent-hover: 139 92 246`，`--vault-accent-dim: 109 40 217`
    - `--vault-char-lower` 改为 `124 58 237`
    - `--vault-success` 改为 `124 58 237`
    - Dark 主题 `.dark` 中 accent 系列改为紫色：`--vault-accent: 167 139 250`，`--vault-accent-hover: 196 181 253`，`--vault-accent-dim: 139 92 246`
    - `--vault-char-lower` 改为 `167 139 250`
    - `--vault-success` 改为 `167 139 250`
  - **Acceptance Criteria Addressed**: [Light 主题紫色配色, Dark 主题紫色配色]
  - **Test Requirements**:
    - `programmatic` TR-1.1: `:root` 中 `--vault-accent` 值为 `124 58 237`
    - `programmatic` TR-1.2: `.dark` 中 `--vault-accent` 值为 `167 139 250`

- [x] Task 2: 更新 tailwind.config.js 动画关键帧
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 
    - 将 `pulseGlow` keyframes 中的 rgba 颜色从 `(0, 212, 170, ...)` 改为 `(167, 139, 250, ...)`
    - 新增 `shimmer` 动画：背景闪光扫描效果
    - 新增 `scale-in` 动画：从 0.95 缩放到 1 并淡入
    - 新增 `bounce-subtle` 动画：轻微弹跳
    - 优化 fadeIn 添加 cubic-bezier 缓动
    - 优化 slideUp 添加 cubic-bezier 缓动
    - 在 animation 配置中注册新动画
  - **Acceptance Criteria Addressed**: [页面进入动画, 持续脉动动画]
  - **Test Requirements**:
    - `programmatic` TR-2.1: `pulseGlow` keyframes 中 boxShadow 使用紫色 rgba
    - `programmatic` TR-2.2: animation 配置中包含 `shimmer`、`scale-in`、`bounce-subtle` 三项
    - `programmatic` TR-2.3: `npm run build` 零错误通过

- [x] Task 3: 更新 index.css 组件样式过渡效果
  - **Priority**: medium
  - **Depends On**: Task 1
  - **Description**: 
    - `.vault-card:hover` 添加 `hover:-translate-y-0.5` 上浮效果
    - `.vault-btn-primary` 添加 `hover:shadow-vault-accent/30` 增强紫色阴影
    - `.sidebar-item.active` 添加 `font-medium` 增强选中态
    - 新增 `.vault-card` 的 `hover:shadow-vault-accent/10` 紫色阴影
  - **Acceptance Criteria Addressed**: [卡片悬停动画, 按钮交互动画]
  - **Test Requirements**:
    - `programmatic` TR-3.1: `.vault-card:hover` 包含 `-translate-y-0.5`
    - `programmatic` TR-3.2: `npm run build` 零错误通过

- [x] Task 4: 构建验证
  - **Priority**: medium
  - **Depends On**: Task 1, Task 2, Task 3
  - **Description**: 运行 `npm run build` 确认所有修改不破坏构建
  - **Test Requirements**:
    - `programmatic` TR-4.1: `npm run build` 零错误通过

# Task Dependencies
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1, Task 2, Task 3]
