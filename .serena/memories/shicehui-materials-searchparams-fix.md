# Next.js 15 /materials searchParams 同步动态 API 修复

## 问题
- 报错：`Route "/materials" used searchParams.studentId. searchParams should be awaited before using its properties.`
- 触发：`app/(dashboard)/materials/page.tsx` 在 Server Component 中直接读取 `searchParams.studentId`。

## 修复
- 将 `MaterialsPage` 改为 `async`。
- 将 `searchParams` 类型改为 `searchParams?: Promise<Record<string, string | string[] | undefined>>`，先 `await` 再读取 `studentId`。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。