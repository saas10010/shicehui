# 批改确认「标记待处理」按钮说明

## 变更
- 在批改确认面板为「标记待处理」按钮增加 Tooltip，便于演示时向客户解释用途。

## 位置
- `components/grading/grading-confirm-panel.tsx`：使用 `Tooltip/TooltipTrigger/TooltipContent` 包裹按钮，文案说明“初稿明显错误/无法确认时先标记为待处理，后续再处理或重新识别（演示：不持久化）”。
