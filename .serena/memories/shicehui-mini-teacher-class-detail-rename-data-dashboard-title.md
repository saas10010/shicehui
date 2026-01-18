# 小程序教师端｜班级详情页“数据看板”标题精简（2026-01-18）

## 需求
- 将“数据看板（本班）”改为“数据看板”。

## 改动
- `app/(mini)/mini/teacher/classes/[classId]/page.tsx`
  - `WechatCell` 标题从 `数据看板（本班）` 改为 `数据看板`。

## 验证
- `npm -s run build` 通过。