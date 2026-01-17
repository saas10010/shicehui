# SidebarNav 重复 key 警告修复

## 问题
- React 警告：`Encountered two children with the same key, '/classes'`。
- 根因：`components/dashboard/nav-items.ts` 里存在多个导航项共享同一个 `href: '/classes'`，而 `components/dashboard/sidebar-nav.tsx` 使用 `key={item.href}`。

## 解决方案
- 给 `NavItem` 增加稳定唯一的 `id` 字段，并在 `SidebarNav` 中改用 `key={item.id}`。
- 保持原型导航行为不变（仍允许多个入口指向同一路由），但 React 列表渲染身份稳定，消除警告。

## 影响文件
- `components/dashboard/nav-items.ts`
- `components/dashboard/sidebar-nav.tsx`

## 验证
- 运行 `npx tsc -p tsconfig.json --noEmit` 通过。