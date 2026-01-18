# 师策汇｜教师端功能迁移到小程序端（2026-01-18）

## 背景
- 客户确认仅保留小程序端，不再使用 PC Web 端来回切换。

## 关键改动
- 教师端小程序（Next.js 模拟微信原生风格）补齐 Web 教师端的所有主功能项：
  - 班级：`/mini/teacher/classes`
  - 作业（聚合批次）：`/mini/teacher/homework`
  - 数据看板：`/mini/teacher/data`
  - 巩固中心（题单与册子/练习任务）：`/mini/teacher/reinforce`
  - 设置：`/mini/teacher/settings`
  - 学生档案：`/mini/teacher/students/[studentId]`
  - 班级内：学生/二维码/批次
    - ` /mini/teacher/classes/[classId]/students`
    - ` /mini/teacher/classes/[classId]/qrcodes`
    - ` /mini/teacher/classes/[classId]/batches`
  - 批次详情（学生/异常）与批改确认：
    - ` /mini/teacher/classes/[classId]/batches/[batchId]`
    - ` /mini/teacher/classes/[classId]/batches/[batchId]/grading`
- 教师端 TabBar 的「班级」Tab 从 `/mini/teacher/batches` 改为 `/mini/teacher/classes`；旧路由保留为重定向。
- 小程序端移除跳转 Web 的入口与文案（入口页/教师端我的页/家长学生端资料页等）。

## 原型状态数据
- 批改确认状态仍通过 `sessionStorage` 存储：
  - `shicehui:grading-confirmed:${batchId}`：已确认学生 ID 列表
  - `shicehui:draft-generation:${batchId}`：初稿生成中/可确认的演示状态
- 题单与册子记录使用 `localStorage`：`shicehui:pdfJobs`
- 练习任务记录使用 `localStorage`：`shicehui:tasks`
- 小程序上传队列使用 `localStorage`：`shicehui:miniQueue`（定义见 `lib/mini/queue.ts`）
