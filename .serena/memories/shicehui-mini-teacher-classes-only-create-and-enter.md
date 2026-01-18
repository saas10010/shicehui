# 小程序教师端｜班级列表页仅保留创建与进入（2026-01-18）

## 需求
- `/mini/teacher/classes`：只保留“创建班级”以及“进入对应班级”。
- 将“导入学生”“巩固中心”迁移到班级详情页 `/mini/teacher/classes/[classId]` 管理。

## 实现
- `components/mini/teacher/class-actions-panel.tsx`
  - `MiniClassActionsPanel` 精简为仅包含“创建班级”。
- `app/(mini)/mini/teacher/classes/page.tsx`
  - 移除“巩固中心”入口卡片。
  - 顶部提示文案更新为：本页仅支持创建班级与进入班级。
- `components/mini/teacher/class-management-panel.tsx`
  - 新增 `MiniClassManagementPanel`：提供“导入学生（原型）”文件选择 + “巩固中心（本班）”入口。
- `app/(mini)/mini/teacher/classes/[classId]/page.tsx`
  - 挂载 `MiniClassManagementPanel`，实现班级内管理入口。

## 验证
- `npm run -s build` 通过。
