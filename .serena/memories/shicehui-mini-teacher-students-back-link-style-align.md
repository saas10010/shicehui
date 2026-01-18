# 小程序教师端｜学生列表页返回入口样式对齐班级详情页（2026-01-18）

## 需求
- `/mini/teacher/classes/[classId]/students` 的“返回上一步”希望与 `/mini/teacher/classes/[classId]` 的“← 返回班级列表”统一位置与风格。

## 改动
- `components/mini/teacher/student-list-panel.tsx`
  - 将返回入口放到标题区下方（与班级详情页同结构：标题行 → 下方返回链接）。
  - 统一绿色链接样式为 `text-sm text-[#07c160]`。
  - 文案调整为“← 返回班级”。

## 验证
- `npm -s run build` 通过。