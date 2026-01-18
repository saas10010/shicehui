# 根路由默认展示小程序原型（2026-01-18）

## 需求
- 访问 `http://localhost:3000/` 时，不再展示旧“入口页”，而是直接展示现有 `/mini`（小程序角色切换页）的内容。

## 实现方式
- `app/page.tsx` 直接复用 `app/(mini)/mini/page.tsx`：
  - `app/page.tsx` 仅保留 `export { default } from './(mini)/mini/page'`。
- 同步调整 `/mini` 页面底部“返回入口页”链接：
  - 从指向 `/` 改为指向 `/studio`，避免循环/指向已移除入口页。

## 影响
- `/` 与 `/mini` 显示同一套页面内容（角色切换入口）。
- `next build` 通过，构建产物中 `/` 与 `/mini` 均正常生成。
