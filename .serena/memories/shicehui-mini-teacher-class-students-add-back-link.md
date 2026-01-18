# 小程序教师端｜学生列表页增加“返回上一步”（2026-01-18）

## 需求
- `/mini/teacher/classes/[classId]/students` 学生列表页增加返回上一步功能。

## 实现
- `components/mini/teacher/student-list-panel.tsx`
  - 在页面顶部卡片新增绿色链接“← 返回上一步”，跳转回班级详情：`/mini/teacher/classes/${classId}`。

## 验证
- `npm -s run build` 通过。