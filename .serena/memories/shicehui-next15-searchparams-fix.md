# Next.js 15 /login searchParams 同步动态 API 修复

## 问题
- 报错：`Route "/login" used searchParams.next. searchParams should be awaited before using its properties.`
- 触发：`app/(auth)/login/page.tsx` 在 Server Component 中直接读取 `searchParams.next`。

## 修复
- 将 `LoginPage` 改为 `async`，并按 Next.js 15 生成的类型要求，把 `searchParams` 定义为 `searchParams?: Promise<Record<string, string | string[] | undefined>>`，先 `await` 再读取字段。
- 增加 `safeNextPathOrEmpty`：仅允许以 `/` 开头且不以 `//` 开头的内部路径；隐藏字段使用净化后的 next，登录 action 继续用该净化并回退到 `/classes`。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。