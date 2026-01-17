# 侧边栏“作业”导航与首屏滚动修复

## 问题
- `/classes` 页侧边栏出现“班级/作业”同时高亮，且点击“作业”仍停留在班级页。
- 首次进入仪表盘页面出现不必要的浏览器滚动条。

## 根因
- `components/dashboard/nav-items.ts` 中“作业”导航项 `href` 误写为 `/classes`，导致与“班级”共享同一路由。
- `app/(dashboard)/layout.tsx` 采用 `min-h-[calc(100svh-6rem)]` 以固定 header 高度计算内容区最小高度，但 header 实际高度随断点/字体变化，易导致整体高度溢出。

## 修复
- 将“作业”导航指向独立路由 `/homework`，并新增聚合批次页：`app/(dashboard)/homework/page.tsx`。
- `middleware.ts` 的 matcher 增加 `/homework/:path*`，保持与其它教师端页面一致的登录保护。
- 移除 `app/(dashboard)/layout.tsx` 中基于固定 header 高度的 `min-h` 计算，避免首屏溢出。

## 影响文件
- `components/dashboard/nav-items.ts`
- `app/(dashboard)/homework/page.tsx`
- `lib/mock/queries.ts`（新增 `getBatches()`，按时间倒序）
- `middleware.ts`
- `app/(dashboard)/layout.tsx`

## 备注
- 当前环境 `next build` 会因无法访问 `fonts.googleapis.com`（`next/font` 拉取 Geist）而失败；建议用 `next dev` 本地验证 UI。