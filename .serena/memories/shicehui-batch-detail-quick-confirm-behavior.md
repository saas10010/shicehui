# 批次详情页「快速确认」交互（原型）

## 需求
- 用户在批次详情页点击「快速确认」需要有明确反馈，并可快速进入批改确认定位到该学生。

## 当前实现
- `components/batches/batch-detail-tabs.tsx`
  - 当学生 `draftStatus !== '可确认'`：按钮 disabled，并提供 tooltip 说明原因（避免“点了没反应”的误解）。
  - 当学生 `draftStatus === '可确认'`：点击后 toast 提示，并跳转到批改确认页：
    - 路径：`/classes/${classId}/batches/${batchId}/grading?studentId=${studentId}`
- `app/(dashboard)/classes/[classId]/batches/[batchId]/grading/page.tsx`
  - 读取 `searchParams.studentId` 并传给面板。
- `components/grading/grading-confirm-panel.tsx`
  - 支持 `defaultStudentId`：若存在且命中列表，则初始选中该学生。