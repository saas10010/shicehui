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

## 部署到 Vercel

### 方式一：通过 GitHub 集成部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **登录 Vercel**
   - 访问 [Vercel](https://vercel.com) 并用 GitHub 账号登录

3. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测为 Next.js 项目

4. **配置项目**
   - Framework Preset: `Next.js`（自动识别）
   - Root Directory: `.`（默认）
   - Build Command: `pnpm build` 或 `next build`
   - Output Directory: `.next`

5. **部署**
   - 点击 "Deploy"，Vercel 会自动构建并部署

6. **访问应用**
   - 部署完成后会生成一个 `.vercel.app` 域名

### 方式二：通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录 Vercel
vercel login

# 部署项目（首次部署会引导配置）
vercel

# 生产环境部署
vercel --prod
```

### 环境变量配置

如果在项目中使用到环境变量，需要在 Vercel 控制台中配置：

1. 进入 Vercel 控制台 → 你的项目 → Settings → Environment Variables
2. 添加所需的环境变量（如 `NEXT_PUBLIC_API_URL` 等）
3. 重新部署项目使配置生效

### 预览部署

每次提交代码到 GitHub，Vercel 会自动创建预览部署，可通过 PR 中的链接查看效果。
