# 师策汇｜Next.js 原型初始化（Style Bootstrap）

## 关键约束
- 回答与界面文案以中文为主；关键交互说明尽量中文化。
- 本次按 `docs/Shicehui_PRD.md` + `docs/Shicehui_UIUX.md` 初始化教师端 PC Web 原型。
- 复刻风格基线来源：`/Users/laiyanfei/ai/codex/styles/neobrutalist-ui-design`（新粗野/Neobrutalist）。

## 项目形态与技术栈
- Next.js 15（App Router），Tailwind + shadcn/ui（Radix）。
- 包管理器：pnpm（`package.json#packageManager` 已标注）。

## 主要路由（教师端原型）
- 登录：`/login`（任意手机号即可进入）
- 班级：`/classes` → `/classes/[classId]/students|qrcodes|batches`
- 批次：`/classes/[classId]/batches/[batchId]`（学生/异常 Tab）
- 批改确认：`/classes/[classId]/batches/[batchId]/grading`
- 数据看板：`/data`（题目/知识点排行）
- 学生档案：`/students/[studentId]`（时间轴/错题/薄弱点）
- 资料中心：`/materials`（生成与记录：本地模拟异步）
- 练习任务：`/tasks`（创建与列表：本地模拟）
- 设置：`/settings`

## 认证与路由保护
- Cookie：`shicehui:auth=1`（原型登录后写入）。
- `middleware.ts` 保护：`/classes|/data|/materials|/tasks|/settings|/students`。
- 退出：侧边栏按钮 POST `/logout` 清理 cookie。

## Mock 数据与原型状态
- Mock 数据集中：`lib/mock/*`。
- 二维码/资料下载为原型占位：`/api/qrcodes/*`、`/api/materials/pdf` 返回 HTML/TXT 以演示下载流程。
- 资料中心与练习任务：使用 `localStorage` 模拟异步队列与持久化。

## 风格与组件复用
- 复用风格项目的 Tailwind/全局样式与 shadcn/ui 组件层；页面布局采用粗边框 + 阴影（Neobrutalist）。
- `app/globals.css` 将主色/辅色对齐 UI/UX 色板（Primary=#2563EB、Secondary=#0EA5E9），并把默认边框更“硬”。
