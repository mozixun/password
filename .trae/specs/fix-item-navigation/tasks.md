# Tasks

- [x] Task 1: 调整 App.tsx 路由顺序
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 将 `/items/detail/:id` 和 `/items/new` 路由移到 `/items/:type` 路由之前
  - **Acceptance Criteria Addressed**: [类型筛选仍正常工作]
  - **Test Requirements**:
    - `human-judgment` TR-1.1: 路由顺序正确，具体路由在动态路由之前

- [x] Task 2: 修改 ItemCard.tsx 导航路径
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 将 `navigate(/items/${item.id})` 改为 `navigate(/items/detail/${item.id})`
  - **Acceptance Criteria Addressed**: [点击项目卡片]
  - **Test Requirements**:
    - `human-judgment` TR-2.1: 项目卡片点击后导航到 `/items/detail/{id}`

- [x] Task 3: 修改 Items.tsx 列表视图导航路径
  - **Priority**: high
  - **Depends On**: None
  - **Description**: 将列表视图中 `navigate(/items/${item.id})` 改为 `navigate(/items/detail/${item.id})`
  - **Acceptance Criteria Addressed**: [点击列表项]
  - **Test Requirements**:
    - `human-judgment` TR-3.1: 列表项点击后导航到 `/items/detail/{id}`

- [x] Task 4: 构建验证
  - **Priority**: medium
  - **Depends On**: Task 1, Task 2, Task 3
  - **Description**: 运行 `npm run build` 验证修改不破坏构建
  - **Test Requirements**:
    - `programmatic` TR-4.1: `npm run build` 零错误通过

# Task Dependencies
- [Task 4] depends on [Task 1, Task 2, Task 3]
