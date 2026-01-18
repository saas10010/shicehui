# 小程序教师端“我的”页移除三项入口

## 需求
- 用户要求在“我的页面”去掉：作业、数据看板、巩固中心。

## 实现
- `app/(mini)/mini/teacher/me/page.tsx`
  - 移除三条 `WechatCell`：
    - 作业（`/mini/teacher/homework`）
    - 数据看板（`/mini/teacher/data`）
    - 巩固中心（`/mini/teacher/reinforce`）
  - 保留“设置 / 回到入口页”等其它入口不变。

## 兼容说明
- 本次仅移除“我的”页入口展示，不删除对应路由文件，也不做重定向；旧链接仍可直接访问。

## 自检
- `npx tsc -p tsconfig.json --noEmit` 通过。