# 师策汇｜小程序原型模拟（Next.js 内实现，微信原生风格）

## 入口
- 总入口页：`/` 同时展示「教师端入口」与「小程序原型入口」。
- 小程序角色切换：`/mini`（教师端 / 家长端 / 学生端）。

## 教师端小程序原型（微信风格）
- Tabs：连拍、队列、班级、我的。
- 路由：
  - 连拍采集：`/mini/teacher/capture`
  - 上传队列：`/mini/teacher/queue`
  - 批次入口（Web 优先）：`/mini/teacher/batches`（跳转到 Web 的批次详情）
  - 我的：`/mini/teacher/me`
- 队列数据：localStorage `shicehui:miniQueue`，类型定义在 `lib/mini/queue.ts`。

## 家长/学生端小程序原型（微信风格）
- Tabs：结果、练习、资料、我的。
- 路由：
  - 结果：`/mini/ps/results`、详情：`/mini/ps/results/[resultId]`
  - 练习：`/mini/ps/tasks`、作答：`/mini/ps/tasks/[taskId]`
  - 资料：`/mini/ps/materials`（读取教师端资料中心生成记录 localStorage `shicehui:pdfJobs`）
  - 我的：`/mini/ps/me`
- 角色：通过 query `role=parent|student` 传递；Tabbar 会自动保留 `role` 参数（实现于 `components/mini/wechat-shell.tsx`）。

## 样式策略
- 小程序页面统一采用“微信原生风格”容器：白底卡片 + 轻边框/阴影 + 底部 Tabbar，组件在 `components/mini/wechat-shell.tsx`。
