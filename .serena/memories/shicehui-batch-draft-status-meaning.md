# 作业批次状态含义（基于当前原型代码）

## 两层状态
- 批次整体状态：`Batch.status`（`lib/mock/types.ts:20`）取值 `processing | ready | needs_attention`，在作业聚合页映射为 `处理中/已完成/待处理`（`app/(dashboard)/homework/page.tsx:7-11`）。
- 学生初稿状态：`BatchStudentItem.draftStatus`（`lib/mock/types.ts:34-41`）取值 `处理中 | 可确认 | 需处理`，用于批改确认与快速确认交互。

## 学生初稿状态语义
- `处理中`：初稿尚未生成/不可用；批改确认面板显示 Skeleton（`components/grading/grading-confirm-panel.tsx:102`）。
- `可确认`：初稿可供教师确认；默认优先选中可确认学生（`components/grading/grading-confirm-panel.tsx:35-37`）；批次详情页“快速确认”仅在该状态启用（`components/batches/batch-detail-tabs.tsx:92-98`）。
- `需处理`：存在异常需要先处理；在 mock 数据中常伴随 `exceptions > 0`（`lib/mock/data.ts:96-103`）；状态徽标按 destructive（红色）渲染（`components/status-badge.tsx:21-28`）。
