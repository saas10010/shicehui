# 教师端班级看板（/data）补齐“按班级查看 + 时间范围筛选”

## 背景
- PRD FR9 / Story 2.6 要求：班级看板按题目/知识点统计错误率排行，支持按时间范围筛选。
- 原实现 `app/(dashboard)/data/page.tsx` 写死 `c-7-1`，页面无法体现“教师管理多个班级”的真实场景。

## 实现要点
- `/data` 页面改为基于 URL 查询参数渲染：
  - `classId`：选择班级
  - `range`：`7d | 30d | all | custom`
  - `start/end`：`range=custom` 时的 `YYYY-MM-DD` 日期范围
- Next.js 15：Server Component 读取 `searchParams` 需 `await`（类型：`searchParams?: Promise<Record<string, string | string[] | undefined>>`）。
- 为保证原型演示稳定，“最近7/30天”的参考时间使用所选班级错题数据中的最大 `createdAt`（`referenceNow`），避免系统日期变化导致无数据。

## UI/交互
- `components/data/data-dashboard.tsx` 增加：
  - 班级下拉选择（切换即更新 query）
  - 时间范围下拉选择（非 custom 直接生效）
  - 自定义日期范围（`type=date` 输入 + 应用按钮）
  - 点击排行项弹窗展示“涉及学生（可跳转学生档案）+ 错题样例”，用于演示下钻

## Mock 数据
- `lib/mock/data.ts` 增加 `c-7-2` 的批次与错题示例（含 `b-20260115-2`、对应 `BATCH_STUDENTS`、`WRONG_QUESTIONS`），便于切换班级后看到差异化数据。

## 约束
- 原型范围内仅做前端状态/URL 驱动过滤与 mock 数据补齐，不引入真实后端与持久化。