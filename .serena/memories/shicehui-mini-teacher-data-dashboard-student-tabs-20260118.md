# 小程序教师端｜数据看板页合并“看板数据 + 学生数据”并增加子 Tabs（2026-01-18）

## 背景/目标
- 需求：在 `/mini/teacher/data?classId=...` 数据看板页中，通过 Tabs 同时查看：
  - 原有“数据看板”统计（题目/知识点排行）
  - 学生侧功能：时间轴、错题、薄弱点
- 同时将“题目 Top / 知识点 Top”改为两个子 Tab 面板切换查看。

## 主要实现
- 页面入口：`app/(mini)/mini/teacher/data/page.tsx` 保持不变，继续从 `searchParams.classId` 传入 `defaultClassId`。
- 核心改动：`components/mini/teacher/data-dashboard-panel.tsx`
  - 新增外层 Tabs（本地 state）：`看板数据` / `学生数据`。
  - 看板数据 Tab 内新增子 Tabs：`题目 Top` / `知识点 Top`，切换展示对应排行列表。
  - 学生数据 Tab：
    - 复用当前班级学生列表（`getStudentsByClassId(classId)`）提供“学生”下拉选择。
    - 提供学生侧子 Tabs：`时间轴` / `错题` / `薄弱点`。
    - 错题与薄弱点基于 `getWrongQuestionsByStudent(studentId)` 聚合展示（原型级别）。
    - 增加“查看学生档案”快捷入口，跳转到 `/mini/teacher/students/[studentId]?classId=...`。
  - 班级切换时：若当前选中学生不在新班级，自动回退为新班级第一个学生（`useEffect` 维护）。

## 约束与取舍
- 原型范围内仅做前端交互与 mock 数据查询，不引入后端/持久化。
- 学生档案页（`/mini/teacher/students/[studentId]`）不强制移除原有功能，避免影响既有入口；数据看板页新增“聚合入口”便于演示。