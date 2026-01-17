# 已确认状态跨页面同步（批改确认 → 批次详情）

## 问题
- 批改确认页的“已确认”是前端演示状态，批次详情页不会自动跟着变。

## 解决（原型）
- 使用 `sessionStorage` 按批次维度共享已确认学生：key = `shicehui:grading-confirmed:${batchId}`，value = `string[]`（studentId 列表）。

## 写入端
- `components/grading/grading-confirm-panel.tsx`
  - 批量确认、确认保存、撤销确认、重新识别前清理确认：都会更新 `sessionStorage`。

## 读取端
- `components/batches/batch-detail-tabs.tsx`
  - 页面加载/窗口聚焦/页面可见时读取 `sessionStorage`，将学生状态显示为「已确认」。
  - 已确认学生的“快速确认”按钮替换为不可点击的「已确认」并提示去批改确认撤销。