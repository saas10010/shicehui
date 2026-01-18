# 小程序教师端｜数据看板页合并“整体看板 + 学生看板”并增加子 Tabs（2026-01-18）

## 背景/目标
- 需求：在 `/mini/teacher/data?classId=...` 数据看板页中，通过 Tabs 同时查看：
  - 原有“数据看板”统计（题目/知识点排行）
  - 学生侧功能：时间轴、错题、薄弱点
- 同时将“题目 Top / 知识点 Top”改为两个子 Tab 面板切换查看。

## 主要实现
- 页面入口：`app/(mini)/mini/teacher/data/page.tsx`
  - 从 `searchParams.classId` 传入 `defaultClassId`
  - 当 URL 带 `classId` 时同时传入 `lockClassId=true`，默认隐藏“班级下拉选择”（入口已确认班级）。
- 核心改动：`components/mini/teacher/data-dashboard-panel.tsx`
  - 新增外层 Tabs（本地 state）：`整体看板` / `学生看板`。
  - 整体看板 Tab：
    - `题目 Top` / `知识点 Top` 作为子 Tabs，切换展示对应排行列表。
    - “时间范围”筛选仅放在整体看板下，避免在“学生看板”场景产生口径误解。
  - 学生看板 Tab：
    - 复用当前班级学生列表（`getStudentsByClassId(classId)`）提供“学生”下拉选择。
    - 提供学生侧子 Tabs：`时间轴` / `错题` / `薄弱点`。
    - 错题与薄弱点基于 `getWrongQuestionsByStudent(studentId)` 聚合展示（原型级别）。
    - （已移除）“查看学生档案”快捷入口，保持界面聚焦在数据看板内。
  - 班级切换时：若当前选中学生不在新班级，自动回退为新班级第一个学生（`useEffect` 维护）。
  - Tabs 按钮改为“分段控件”样式，并整体压缩区块间距，提升紧凑度。

## 约束与取舍
- 原型范围内仅做前端交互与 mock 数据查询，不引入后端/持久化。
- 学生档案页（`/mini/teacher/students/[studentId]`）不强制移除原有功能，避免影响既有入口；数据看板页新增“聚合入口”便于演示。

## 补充（入口联动）
- 班级学生列表点击学生后，将跳转到 `/mini/teacher/data?classId=...&tab=student&studentId=...`，直接打开“学生看板”Tab 并预选该学生。
- 数据看板页支持从 URL 读取：
  - `tab=student`：默认打开“学生看板”Tab
  - `studentId=...`：默认选中指定学生
