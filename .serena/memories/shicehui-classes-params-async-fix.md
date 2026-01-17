# Next.js 15 /classes 动态路由 params 同步动态 API 修复

## 问题
- 报错：`Route "/classes/[classId]" used params.classId. params should be awaited before using its properties.`
- 触发：多个动态路由页面/布局在 Server Component 中直接读取 `params.classId`（以及 `batchId`）。

## 修复
- 将相关页面/布局改为 `async`，并将 `params` 类型改为 `Promise<...>`；先 `await params` 再解构使用。
- 覆盖路径：
  - `app/(dashboard)/classes/[classId]/layout.tsx`
  - `app/(dashboard)/classes/[classId]/page.tsx`
  - `app/(dashboard)/classes/[classId]/students/page.tsx`
  - `app/(dashboard)/classes/[classId]/batches/page.tsx`
  - `app/(dashboard)/classes/[classId]/qrcodes/page.tsx`
  - `app/(dashboard)/classes/[classId]/batches/[batchId]/page.tsx`
  - `app/(dashboard)/classes/[classId]/batches/[batchId]/grading/page.tsx`

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。