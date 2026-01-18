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

---

## 自建服务器部署（PM2）

### 准备工作

1. **服务器要求**
   - Node.js 18+（推荐使用 nvm 管理）
   - pnpm: `npm install -g pnpm`
   - PM2: `npm install -g pm2`

2. **服务器开放端口**
   - 默认端口 3000，或自定义端口

### 部署步骤

1. **构建生产版本**
   ```bash
   pnpm install
   pnpm build
   ```

2. **服务器配置**

   如果使用 Nginx 反向代理，配置示例：

   ```nginx
   # Nginx 配置示例（完整版）
   server {
       listen 80;
       server_name your-domain.com;

       # 重定向到 HTTPS（可选）
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       # SSL 证书配置（Let's Encrypt 免费证书）
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       ssl_session_timeout 1d;
       ssl_session_cache shared:SSL:50m;
       ssl_session_tickets off;

       # SSL 安全配置
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;

       # 添加 HSTS 头（可选）
       add_header Strict-Transport-Security "max-age=63072000" always;

       # 日志配置
       access_log /var/log/nginx/shicehui_access.log;
       error_log /var/log/nginx/shicehui_error.log;

       # Gzip 压缩
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_proxied any;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
       gzip_disable "MSIE [1-6]\.";

       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;

           # 超时配置
           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }
   }
   ```

### 证书申请（Let's Encrypt）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

### 设置自动续期

```bash
# 添加 crontab 任务
sudo crontab -e

# 添加以下行（每天凌晨检查续期）
0 0 * * * certbot renew --quiet
```

3. **启动 PM2**

   创建 `ecosystem.config.js`（可选）：

   ```javascript
   module.exports = {
     apps: [{
       name: 'shicehui',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/your/project',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

   启动应用：
   ```bash
   # 直接启动
   pm2 start pnpm --name "shicehui" -- start

   # 或使用 ecosystem 配置
   pm2 start ecosystem.config.js
   ```

4. **PM2 常用命令**

   ```bash
   # 查看状态
   pm2 status

   # 查看日志
   pm2 logs shicehui

   # 重启
   pm2 restart shicehui

   # 停止
   pm2 stop shicehui

   # 删除
   pm2 delete shicehui

   # 保存进程列表（开机自启）
   pm2 save

   # 设置开机自启
   pm2 startup
   ```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建
   pnpm build

# 重启 PM2
pm2 restart shicehui
```
