# 小程序教师端｜班级详情页移除“二维码下载/打印”与“作业（聚合视图）”（2026-01-18）

## 需求
- `/mini/teacher/classes/[classId]` 班级详情页：
  - 去掉“二维码下载/打印”功能入口（不再需要）。
  - 去掉“作业（聚合视图）”，避免与“作业批次”重复，仅管理本班作业批次。

## 改动
- 文件：`app/(mini)/mini/teacher/classes/[classId]/page.tsx`
  - 删除列表项：
    - `二维码下载/打印`（原型入口 `/mini/teacher/classes/[classId]/qrcodes`）
    - `作业（聚合视图）`（入口 `/mini/teacher/homework?classId=...`）
  - 同步移除多余的 `WechatDivider`，保持列表分隔正常。

## 验证
- `npm -s run build` 通过。