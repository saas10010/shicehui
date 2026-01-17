# 批改确认「待处理」演示状态

## 背景
- UI/UX 文档提到批改确认左侧需要展示进度（未处理/已确认/待处理），但原型数据的 `draftStatus` 只有 `处理中/可确认/需处理`。

## 实现（原型演示）
- `components/grading/grading-confirm-panel.tsx`
  - 新增本地状态 `pendingStudentIds:Set<string>`。
  - 点击「标记待处理」后，把当前学生加入 `pendingStudentIds`，左侧学生列表与右上角状态徽标显示为「待处理」（并带 Tooltip 说明）。
  - 该状态仅用于演示，不修改 mock 数据、不持久化。