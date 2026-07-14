# Tasks

- [x] Task 1: 更新 CSS 变量配色系统
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 
    - Light 主题 `:root` 中微调 `--vault-bg` 为 `245 245 250`，新增 `--vault-glass: 255 255 255`、`--vault-glass-border: 255 255 255`
    - Dark 主题 `.dark` 中微调 `--vault-surface` 为 `20 25 45`、`--vault-card` 为 `25 30 55`、`--vault-bg` 为 `8 10 20`，新增 `--vault-glass: 30 35 60`、`--vault-glass-border: 255 255 255`
    - 在 tailwind.config.js colors.vault 中注册 `glass` 和 `glass-border` 颜色
  - **Acceptance Criteria Addressed**: [毛玻璃表面系统]
  - **Test Requirements**:
    - `programmatic` TR-1.1: `:root` 中存在 `--vault-glass` 变量
    - `programmatic` TR-1.2: `.dark` 中存在 `--vault-glass` 变量
    - `programmatic` TR-1.3: tailwind.config.js colors.vault 包含 `glass` 键

- [x] Task 2: 重新设计组件样式层
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**: 
    - 修改 `.vault-card` 为 `bg-vault-card/60 backdrop-blur-xl border border-vault-border/50 rounded-2xl transition-all duration-300`，hover 时 `shadow-xl shadow-vault-accent/10 -translate-y-1 border-vault-accent/30`
    - 修改 `.vault-btn-primary` 增加 `backdrop-blur-sm`，hover 阴影改为 `hover:shadow-vault-accent/40`，增加 `hover:-translate-y-0.5`
    - 修改 `.vault-input` 为 `bg-vault-surface/50 backdrop-blur-sm`，聚焦时 `focus:ring-2 focus:ring-vault-accent/20`
    - 修改 `.sidebar-item` 圆角改为 `rounded-xl`，active 态改为 `bg-vault-accent/15 backdrop-blur-sm`
    - 新增 `.glass-panel` 组件类：`bg-vault-glass/10 backdrop-blur-2xl border border-vault-glass-border/20 rounded-2xl`
    - 新增 `.glass-nav-item` 组件类：`flex items-center gap-3 px-4 py-2.5 rounded-xl text-vault-text-secondary transition-all duration-300 cursor-pointer hover:bg-vault-glass/10 backdrop-blur-sm`，active 态 `bg-vault-accent/15 text-vault-accent backdrop-blur-sm`
  - **Acceptance Criteria Addressed**: [毛玻璃表面系统]
  - **Test Requirements**:
    - `programmatic` TR-2.1: `.vault-card` 定义中包含 `backdrop-blur-xl` 和 `bg-vault-card/60`
    - `programmatic` TR-2.2: `.glass-panel` 类已定义
    - `programmatic` TR-2.3: `.glass-nav-item` 类已定义

- [x] Task 3: 更新 AppLayout 毛玻璃效果
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**: 
    - 顶部 header 的 `bg-vault-surface/50 backdrop-blur-sm` 改为 `bg-vault-surface/60 backdrop-blur-xl`
    - 底部边框从 `border-b border-vault-border` 改为渐变线效果：在 header 底部添加一个 `h-px bg-gradient-to-r from-transparent via-vault-border/50 to-transparent` 的 div
    - 主内容区背景添加微妙的径向渐变 `bg-vault-bg` 上叠加 `before` 伪元素或直接在 div 上添加 `bg-gradient-to-b from-vault-bg to-vault-bg/80`
  - **Acceptance Criteria Addressed**: [毛玻璃顶部栏]
  - **Test Requirements**:
    - `programmatic` TR-3.1: header 包含 `backdrop-blur-xl`
    - `programmatic` TR-3.2: 存在渐变线 div

- [x] Task 4: 更新 Sidebar 毛玻璃效果
  - **Priority**: high
  - **Depends On**: Task 1
  - **Description**: 
    - aside 背景从 `bg-vault-surface` 改为 `bg-vault-surface/60 backdrop-blur-2xl`
    - 边框从 `border-r border-vault-border` 改为 `border-r border-vault-border/50`
    - 导航项使用 `rounded-xl`（与 sidebar-item 组件类同步）
    - Logo 区背景透明化，与侧边栏融为一体
  - **Acceptance Criteria Addressed**: [毛玻璃侧边栏]
  - **Test Requirements**:
    - `programmatic` TR-4.1: aside 包含 `backdrop-blur-2xl`
    - `programmatic` TR-4.2: aside 包含 `bg-vault-surface/60`

- [x] Task 5: 重新设计登录页背景
  - **Priority**: medium
  - **Depends On**: Task 1
  - **Description**: 
    - 移除 Login.tsx 中的 `.gradient-mesh` 旧背景和内嵌 `<style>` 标签中的 meshFloat 动画
    - 替换为 2-3 个紫色径向渐变光晕 div，使用 `absolute` 定位 + `blur-3xl` + `opacity-20` + `animate-float`
    - 登录卡片改为 `.glass-panel` 风格：`bg-vault-card/50 backdrop-blur-2xl border border-vault-glass-border/20 rounded-3xl`
    - Logo 图标容器圆角改为 `rounded-3xl`
  - **Acceptance Criteria Addressed**: [登录页光晕背景]
  - **Test Requirements**:
    - `programmatic` TR-5.1: Login.tsx 中不存在 `gradient-mesh` 字符串
    - `programmatic` TR-5.2: Login.tsx 中存在 `blur-3xl` 或 `backdrop-blur-2xl`

- [x] Task 6: 新增毛玻璃动画效果
  - **Priority**: medium
  - **Depends On**: Task 1
  - **Description**: 
    - 在 tailwind.config.js 中新增 `glass-expand` 动画：从 scale(0.95) + blur(8px) 到 scale(1) + blur(0) + opacity 渐入，0.4s cubic-bezier
    - 新增 `spring-bounce` 动画：弹性回弹缩放，0.5s
    - 新增 `glow-flow` 动画：光晕位置流动，6s infinite
    - 注册对应 keyframes
  - **Acceptance Criteria Addressed**: [玻璃展开动画, 弹性回弹]
  - **Test Requirements**:
    - `programmatic` TR-6.1: animation 配置中包含 `glass-expand`、`spring-bounce`、`glow-flow`
    - `programmatic` TR-6.2: keyframes 中包含对应的 `glassExpand`、`springBounce`、`glowFlow`

- [x] Task 7: 构建验证
  - **Priority**: high
  - **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5, Task 6
  - **Description**: 运行 `npm run build` 确认所有修改不破坏构建
  - **Test Requirements**:
    - `programmatic` TR-7.1: `npm run build` 零错误通过

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1]
- [Task 5] depends on [Task 1]
- [Task 6] depends on [Task 1]
- [Task 7] depends on [Task 1, Task 2, Task 3, Task 4, Task 5, Task 6]
