# /materials 个人资料：学生改为下拉选择

## 背景/问题
- `components/materials/materials-center.tsx` 的“生成个人练习册/复习册”原先学生字段使用 `Input` 可自由输入。
- 原型演示中会导致口径不统一、易误输，且无法体现“从学生档案跳转过来默认选中该学生”的体验。

## 改动
- 学生：改为 `Select` 下拉，数据源使用 `lib/mock/data.ts` 的 `STUDENTS`。
- 展示文案：下拉项展示 `班级 · 姓名（#学号）`，目标是快速辨识。
- 默认选中：若 `defaultStudentId`（来自 `/materials?studentId=...`）存在且能匹配 `STUDENTS`，则自动选中该学生；否则默认选择列表第一个学生。
- 生成任务：`targetLabel` 使用 `班级 · 姓名（#学号）` 作为生成记录展示，避免仅显示 ID。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。
