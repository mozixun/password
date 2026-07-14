# Tasks

- [x] Task 1: 在 index.css 中定义 light/dark 两套 CSS 变量
  - [x] SubTask 1.1: 在 `:root` 中定义 light 主题变量（浅色背景、深色文字等）
  - [x] SubTask 1.2: 在 `.dark` 选择器中定义 dark 主题变量（保持现有深色配色）
  - [x] SubTask 1.3: 移除 `body` 中硬编码的 background-color 和 color，改用 CSS 变量
  - [x] SubTask 1.4: 更新滚动条颜色使用 CSS 变量
  - [x] SubTask 1.5: 更新密码字符颜色使用 CSS 变量

- [x] Task 2: 修改 tailwind.config.js 颜色映射为 CSS 变量
  - [x] SubTask 2.1: 将所有 `vault.*` 颜色值改为 `rgb(var(--vault-*) / <alpha-value>)` 格式
  - [x] SubTask 2.2: CSS 变量使用 RGB 通道格式以支持 alpha 透明度修饰符

- [x] Task 3: 创建 useThemeEffect hook 并在 App.tsx 中调用
  - [x] SubTask 3.1: 重写 `src/hooks/useTheme.ts`，订阅 store.ui.theme 并同步 `<html>` class
  - [x] SubTask 3.2: 支持 `system` 模式：使用 `matchMedia('(prefers-color-scheme: dark)')` 监听系统偏好
  - [x] SubTask 3.3: 在 App 组件中调用 `useThemeEffect()`

- [x] Task 4: 构建验证
  - [x] SubTask 4.1: `npm run build` 零错误通过

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1, Task 2, Task 3]
