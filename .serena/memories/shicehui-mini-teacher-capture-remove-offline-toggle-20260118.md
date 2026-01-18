# Mini 教师端连拍页移除“切到离线”（2026-01-18）

## 需求
- `/mini/teacher/capture` 不再需要“切到离线/切回在线”功能，移除对应按钮与逻辑。

## 实施要点
- `components/mini/teacher/capture-panel.tsx`
  - 移除 `offline` state 与“切到离线”按钮。
  - 新增队列项统一写入 `status: 'pending'`。
  - 预览状态文案仅保留：待上传/上传中/成功/失败。
- `components/mini/teacher/queue-panel.tsx`
  - 移除离线相关文案与“网络恢复（续传）”按钮。
- `lib/mini/queue.ts`
  - 移除 `MiniQueueStatus` 的 `'offline'`。
  - `safeParseQueue` 增强为运行时清洗：遇到历史数据 `status: 'offline'`（或任何未知状态）统一归一为 `'pending'`，并对 `progress` 做 0-100 clamp。

## 背景约束（来自项目记忆）
- 项目方向是只保留小程序端（Next.js 模拟微信），逐步清理“切换/跳转 Web 端”的入口与文案；本次移除离线切换也符合“减少非必要演示入口”的原则。
