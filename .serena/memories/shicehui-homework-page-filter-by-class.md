# /homework 作业聚合页增加“按班级筛查”

## 需求
- 老师管理多个班级时，作业聚合页需要支持按班级筛选批次列表。

## 实现
- `app/(dashboard)/homework/page.tsx`
  - 改为 `async` 并 `await searchParams`（Next.js 15 同步动态 API 要求）。
  - 读取 `classId` query：有效则按班级过滤，否则展示全部班级。
  - 顶部展示当前筛选与批次数量。
- `components/homework/homework-class-filter.tsx`
  - 使用 `Select` 提供“全部班级 + 班级列表”下拉。
  - 通过 `router.push` 写入/清除 `classId` query，并保留其它 query。

## 使用方式
- 全部：`/homework`
- 指定班级：`/homework?classId=c-7-1`