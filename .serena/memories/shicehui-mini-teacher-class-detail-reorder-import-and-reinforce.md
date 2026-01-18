# 小程序教师端｜班级详情页重排“导入学生/巩固中心”位置（2026-01-18）

## 需求
- `/mini/teacher/classes/[classId]`：
  - “导入学生”放到页面最上方（操作列表第一项）。
  - “巩固中心”放到“数据看板（本班）”下面。

## 实现
- `components/mini/teacher/class-management-panel.tsx`
  - 新增拆分组件：
    - `MiniClassStudentImportCell`（文件选择 + toast 模拟导入）
    - `MiniClassReinforceCell`（跳转巩固中心）
  - 保留 `MiniClassManagementPanel` 作为组合封装（兼容后续可能复用）。
- `app/(mini)/mini/teacher/classes/[classId]/page.tsx`
  - 在班级详情页的操作列表 `WechatCard` 内：
    - 将 `MiniClassStudentImportCell` 移到最顶部。
    - 将 `MiniClassReinforceCell` 放到“数据看板（本班）”下方。

## 验证
- `npm -s run build` 通过。