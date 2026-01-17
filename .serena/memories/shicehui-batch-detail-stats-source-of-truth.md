# 批次详情页统计口径与 mock 数据一致性

## 现象
- 批次详情页头部卡片使用 `Batch.totalImages/processedImages/exceptionImages` 展示「总数/已处理/异常」。
- 详情页 Tab 内异常数量使用 `exceptions.length`（来自 `getBatchExceptions(batchId)`）。
- 学生卡片展示每个学生的 `imageCount`（来自 `getBatchStudentItems(batchId)`）。

若 mock 数据未对齐，会出现：头部「异常」≠ 异常 Tab 数量，或「已处理/总数」与学生张数直观不一致。

## 建议约束（做原型时优先遵守）
- 对于有详情页数据的批次：
  - `BATCH_EXCEPTIONS` 中该批次条目数量应与 `Batch.exceptionImages` 一致（保证头部与异常 Tab 同口径）。
  - `BATCH_STUDENTS` 中该批次所有 `imageCount` 合计应与 `Batch.processedImages` 一致（保证头部与学生视图同口径）。
  - 通常保持 `Batch.totalImages = Batch.processedImages + Batch.exceptionImages`，便于理解「总数=已处理+异常」。

## 本次修复
- `lib/mock/data.ts`：将 `b-20260116-1` 的学生 `imageCount` 合计对齐到 `processedImages=38`，并补齐异常条目到 4 条以对齐 `exceptionImages=4`。