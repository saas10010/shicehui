# 批改确认页返回入口

## 需求
- 从批次详情进入“批改确认”后，需要一个返回入口回到该批次详情页。

## 实现
- `app/(dashboard)/classes/[classId]/batches/[batchId]/grading/page.tsx`
  - 在页头新增「返回批次详情」链接：`/classes/${classId}/batches/${batchId}`。
  - 位置与学生档案页的返回链接风格一致（下划线 + muted 文案）。