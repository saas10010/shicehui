# 师策汇｜教师端 Next.js 原型

本仓库为「师策汇」教师端 PC Web 原型项目，依据：

- PRD：`docs/Shicehui_PRD.md`
- UX/UI：`docs/Shicehui_UIUX.md`

并以风格项目（新粗野 / Neobrutalist）作为视觉基底进行复刻与裁剪。

## ✅ 已覆盖的可点击流程（原型）

- 入口页：`/`（教师端入口 + 小程序原型入口）
- 登录：`/login`（任意手机号即可进入）
- 班级：`/classes` → `班级详情（学生/二维码/作业批次）`
- 作业批次：批次详情（学生/异常）→ 批改确认
- 学生档案：时间轴/错题/薄弱点
- 数据看板：题目排行 / 知识点排行（弹窗下钻占位）
- 资料中心：全班题单 / 个人资料 / 生成记录（本地模拟异步）
- 练习任务：创建任务与列表（本地模拟）
- 设置：偏好开关（本地模拟）
- 小程序原型（微信原生风格）：`/mini`（角色切换：教师/家长/学生）
  - 教师端：`/mini/teacher/capture`、`/mini/teacher/queue`、`/mini/teacher/batches`、`/mini/teacher/me`
  - 家长/学生端：`/mini/ps/results`、`/mini/ps/tasks`、`/mini/ps/materials`、`/mini/ps/me`

## 本地开发

本项目使用 `pnpm`：

```bash
pnpm install
pnpm dev
```

然后打开 `http://localhost:3000`。
