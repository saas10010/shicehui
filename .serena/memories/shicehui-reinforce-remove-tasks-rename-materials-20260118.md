# 巩固中心：移除练习任务，册子改为“历史错题/错题变体”

## 需求
- 小程序教师端巩固中心不再提供「练习任务」相关入口与交互。
- 「生成练习册」→「生成历史错题」
- 「生成复习题/复习册」→「生成错题变体」

## 关键改动点
- 教师端（小程序）
  - `app/(mini)/mini/teacher/reinforce/page.tsx`：不再支持 `tab=tasks`，页面仅展示资料生成。
  - `components/mini/teacher/reinforce-panel.tsx`：移除 tabs 与 `MiniTasksPanel`，并在 URL 存在非 `materials` 的 tab 时强制归一到 `materials`。
  - `components/mini/teacher/materials-panel.tsx`：按钮与 job 类型改为“个人历史错题 / 个人错题变体”，文案同步更新。

- 教师端（Web Dashboard）
  - `components/reinforce/reinforce-center.tsx`：移除「练习任务」Tab，仅保留「题单与册子」。
  - `app/(dashboard)/tasks/page.tsx`：改为重定向到 `tab=materials`。
  - `app/(dashboard)/reinforce/page.tsx`：tab 归一到 `materials`。

- 家长/学生端（小程序）
  - `components/mini/ps/ps-tabs.ts`：移除「练习」Tab。
  - `app/(mini)/mini/ps/tasks/page.tsx`、`app/(mini)/mini/ps/tasks/[taskId]/page.tsx`：统一重定向到 `/mini/ps/materials?role=...`，避免旧链接 404。
  - `components/mini/ps/result-detail.tsx`、`app/(mini)/mini/page.tsx`：移除/替换练习任务入口文案。

## 类型与兼容
- `lib/mock/types.ts`
  - `PdfJobType` 新增：`个人历史错题`、`个人错题变体` 等。
  - 为避免本地 localStorage 旧记录显示异常，保留旧类型字符串：`个人练习册/个人复习册/个人练习册/复习册`。

## 自检
- `npm run build` 可通过（该项目 Next build 默认跳过 types 校验）。
