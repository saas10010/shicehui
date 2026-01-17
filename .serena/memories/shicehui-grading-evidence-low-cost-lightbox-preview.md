# 证据视图：最低成本路线 + 点击大图预览

## 背景
- 为降低上游 AI 技术成本，证据视图从“双模式（整份作业/按题证据）”降级为仅“整份作业按页浏览 + 按题跳页联动”。
- 同时将缩放按钮（放大/缩小）改为“点击图片弹出大图预览（半透明背景）”，更符合看图场景。

## 关键实现
- 证据视图组件：`components/grading/grading-evidence-view.tsx`
  - 移除缩放状态与放大/缩小按钮；保留旋转。
  - 点击预览区图片打开 Radix Dialog 大图预览，Overlay 使用 `bg-black/30`（半透明）。
  - 切换学生（resetKey 变化）会重置页码/旋转并关闭预览弹窗，避免状态串台。
- 批改确认页接入：`components/grading/grading-confirm-panel.tsx`
  - `EvidenceByQuestionId` 仅保留 `pageIndex`（题→页），不再依赖框选坐标与裁切证据。
  - 证据设置只持久化 `linkageEnabled` 到 `sessionStorage`（按批次 key：`shicehui:grading-evidence-settings:${batchId}`）。

## 上游最小契约（建议）
- 对每题输出 `pageIndex` 即可跑通联动（题→页）。
- 精确框选（boxes）与按题裁切（items）作为后续迭代能力再引入。