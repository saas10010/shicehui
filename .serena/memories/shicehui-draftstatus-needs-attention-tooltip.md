# 「需处理」状态悬浮说明（演示增强）

## 目标
- 在演示时让客户一眼理解「需处理」含义：该学生存在异常需先处理（缺码/识别冲突/码损坏等），处理后再确认。

## 实现
- `components/grading/grading-confirm-panel.tsx`：
  - 全局包裹 `TooltipProvider`。
  - 当 `draftStatus === '需处理'` 时，状态徽标用 Tooltip 展示说明（学生列表与右上角状态徽标）。
- `components/batches/batch-detail-tabs.tsx`：
  - 全局包裹 `TooltipProvider`。
  - 当 `draftStatus === '需处理'` 时，学生卡片状态徽标用 Tooltip 展示说明。

## 文案
- 统一文案：`该学生存在异常需先处理（缺码/识别冲突/码损坏等），处理后再确认。`
