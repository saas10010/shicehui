# mini 教师端巩固中心：从班级入口进入时锁定班级上下文

## 目标
- 当 URL 携带 `classId`（从班级入口进入）时：生成参数必须严格以该班为上下文。

## 实现
- `components/mini/teacher/reinforce-panel.tsx`
  - 读取 query `classId` 并透传给 `MiniMaterialsPanel` 作为 `defaultClassId`。
  - `defaultStudentId` 优先取 query `studentId`，用于支持可分享链接。

- `components/mini/teacher/materials-panel.tsx`
  - 新增 `defaultClassId` 入参；当其有效时视为 `lockedClassId`。
  - `lockedClassId` 存在时：班级下拉禁用（锁定）；学生下拉只展示该班学生。
  - 当班级变化导致当前学生不在该班时，自动回退到该班第一个学生。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过（顺带修复了 `components/materials/materials-center.tsx` 的默认 PersonalDocKind 初始化值）。