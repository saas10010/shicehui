# 小程序原型｜返回入口位置与样式统一（2026-01-18）

## 目标
- 统一小程序原型各「详情/子页面」的返回入口：位置一致、风格一致，并补齐缺失的返回功能。

## 统一规范
- 返回链接样式：`text-sm text-[#07c160]`
- 放置位置：页面首个 `WechatCard` 的标题区下方，使用容器 `div.mt-3`（结构：标题行/说明 → 返回链接 → 后续内容）。

## 覆盖页面/组件（关键改动点）
- 学生档案页（教师端）：`app/(mini)/mini/teacher/students/[studentId]/page.tsx`
  - 将“← 返回学生列表”从卡片顶部移到标题区下方，并对齐样式。
- 作业页（教师端）：`app/(mini)/mini/teacher/homework/page.tsx`
  - 将底部“← 返回班级”移入顶部标题卡片下方，样式统一。
- 作业批次列表（班级内）：`app/(mini)/mini/teacher/classes/[classId]/batches/page.tsx`
  - 增加“← 返回班级”。
- 批次详情（教师端组件）：`components/mini/teacher/batch-detail-panel.tsx`
  - 增加“← 返回批次列表”。
- 批改确认（教师端组件）：`components/mini/teacher/grading-confirm-panel.tsx`
  - 统一“← 返回批次详情”样式与位置。
- 数据看板（教师端组件）：`components/mini/teacher/data-dashboard-panel.tsx`
  - 增加“← 返回班级”（指向当前选中班级）。
- 巩固中心（教师端组件）：`components/mini/teacher/reinforce-panel.tsx`
  - 增加返回入口：优先返回学生档案（带 `studentId`），否则返回班级（带 `classId`），否则返回班级列表。
- 结果详情（家长/学生端组件）：`components/mini/ps/result-detail.tsx`
  - 将“← 返回结果列表”上移到标题卡片下方并统一样式。
- 作答页（家长/学生端组件）：`components/mini/ps/tasks.tsx`
  - 增加“← 返回任务列表”。

## 验证
- `npm -s run build` 通过。