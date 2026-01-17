# 全局布局宽度与批改确认页证据视图显示不完整（宽度不足）修复

## 现象
- `/classes/[classId]/batches/[batchId]/grading` 的「批改确认」页面中，右侧“证据视图”在常见屏幕宽度下会显得被挤压/显示不完整。

## 根因定位
1. 全局外层框架宽度被限制：
   - `components/brutal/brutal-frame.tsx` 的 `BrutalFrame` 使用 `max-w-7xl`，导致整个 dashboard 内容区最大宽度固定在 1280px。
2. 批改确认页存在多层“固定列宽”叠加：
   - `app/(dashboard)/layout.tsx`：左侧导航固定 `md:grid-cols-[280px_1fr]`。
   - `components/grading/grading-confirm-panel.tsx`：学生列表固定列宽（原为 `md:grid-cols-[320px_1fr]`），右侧又有「题目/答案 + 证据视图」双列（`lg ... 420px / xl ... 480px`）。
   - 多层固定列宽叠加后，右侧内容可用宽度不足，导致证据面板被挤压。

## 修复要点
- 扩大全局框架最大宽度：
  - `components/brutal/brutal-frame.tsx`：将 `max-w-7xl` 调整为 `max-w-screen-2xl`，在大屏/常见笔记本分辨率下释放可用宽度。
- 优化批改确认页栅格列宽以更抗挤压：
  - `components/grading/grading-confirm-panel.tsx`
    - 学生列表列宽改为 `md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]`（允许在窄屏时自动收缩）。
    - 题目/答案 + 证据视图列改为 `lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_560px]`。
    - 给左右两列容器补 `min-w-0`，避免内容的最小宽度撑破导致溢出/裁切。

## 结论：如何继续调宽/调窄
- 如果还需要全局更宽：继续在 `components/brutal/brutal-frame.tsx` 调整 `max-w-*`（例如改为 `max-w-none` 或更大的自定义值）。
- 如果只想“批改确认页”更宽：优先保持 `BrutalFrame` 可被 `className` 覆盖的机制，在对应 layout/页面给 `<BrutalFrame className="...">` 传入更大的 `max-w-*`（避免影响所有页面）。
