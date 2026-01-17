# Next.js 15 /students 与 mini/ps 路由 params/searchParams 同步动态 API 修复

## 问题
- 报错：`Route "/students/[studentId]" used params.studentId. params should be awaited before using its properties.`
- 同类风险：`app/(mini)/mini/ps/**` 中动态路由页面直接读取 `params.xxx`，以及多处页面直接读取 `searchParams.role`。

## 修复
- 将相关页面改为 `async`，并把 `params` / `searchParams` 类型调整为 `Promise<...>`（`searchParams` 设为可选），先 `await` 再读取字段。
- 覆盖路径：
  - `app/(dashboard)/students/[studentId]/page.tsx`
  - `app/(mini)/mini/ps/tasks/page.tsx`
  - `app/(mini)/mini/ps/results/page.tsx`
  - `app/(mini)/mini/ps/materials/page.tsx`
  - `app/(mini)/mini/ps/me/page.tsx`
  - `app/(mini)/mini/ps/tasks/[taskId]/page.tsx`
  - `app/(mini)/mini/ps/results/[resultId]/page.tsx`

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。