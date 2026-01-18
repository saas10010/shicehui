# 小程序教师端｜班级列表页移除“作业/数据看板”入口（2026-01-18）

## 背景
- 班级详情页 ` /mini/teacher/classes/[classId] ` 已提供：
  - 作业（聚合视图，按班级筛选）
  - 数据看板（本班）

## 改动
- 文件：`app/(mini)/mini/teacher/classes/page.tsx`
  - 移除入口：
    - “作业”（`/mini/teacher/homework`）
    - “数据看板”（`/mini/teacher/data`）
  - 顶部提示文案改为：作业/数据看板入口已移至班级详情页；本页保留班级列表与巩固中心。

## 验证
- `npm run -s build` 通过。
