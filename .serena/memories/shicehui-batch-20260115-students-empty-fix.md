# b-20260115-1 批次详情学生 Tab 为空的原因与修复

## 原因
- 批次详情页学生 Tab 渲染的是 `getBatchStudentItems(batchId)` 返回的 `BATCH_STUDENTS`。
- mock 中 `b-20260115-1` 没有对应的 `BATCH_STUDENTS` 条目，所以学生 Tab 为空。

## 修复
- `lib/mock/data.ts`：为 `b-20260115-1` 补齐 8 个学生条目（s-001 ~ s-008），并让 `imageCount` 合计=40，与该批次 `processedImages=40` 对齐。