# /mini/teacher/reinforce 生成参数合理性评估（materials）

## 现状
- 路由：`app/(mini)/mini/teacher/reinforce/page.tsx` 仅从 `searchParams.studentId` 解析并透传 `defaultStudentId`。
- 容器：`components/mini/teacher/reinforce-panel.tsx` 读取 `classId/studentId/tab`：
  - `classId/studentId` 仅用于返回链接（backHref/backLabel）。
  - `tab` 若非 `materials` 会被归一到 `materials`（兼容旧链接）。
- 生成参数 UI：`components/mini/teacher/materials-panel.tsx` 的“生成参数”包含：班级、学生、时间范围（含自定义起止日期校验）。
  - 默认班级：`CLASSES[0]?.id`（不读取 URL `classId`）。
  - 默认学生：优先使用 `defaultStudentId`（来自 URL `studentId`），否则 `STUDENTS[0]?.id`。

## 结论
- 原型演示层面整体合理：字段符合“全班题单/个人历史错题/个人错题变体”的操作需求，时间范围校验也完整。
- 但一致性不足：URL `classId` 作为“从班级进入巩固中心”的上下文，没有参与默认选中/学生列表范围，容易出现“页面上下文是某班，但生成参数仍是其他班/混班”的体验落差（当前仅因 `CLASSES[0]` 常为 `c-7-1` 才看起来对）。

## 建议（如需提升）
- 将 `classIdFromQuery` 透传到 `MiniMaterialsPanel`，用于默认 `selectedClassId`。
- 将学生下拉按 `selectedClassId` 过滤（或至少在 option 文案中展示 `班级 · 姓名（#学号）`）。
- 可选：把 `selectedClassId/selectedStudentId/range` 同步到 URL，保证可分享/可回退的状态一致性。
- 若对接真实接口：生成请求应使用 `classId/studentId + rangePreset/start/end` 等结构化参数，而不仅是可读 label。