# 小程序教师端｜学生看板子 Tabs：时间轴 vs 错题 vs 薄弱点（差异与问题定位）

## 页面与入口
- 路由：`/mini/teacher/data`
- 参数：`tab=student` 默认打开“学生看板”；`studentId=...` 默认选中学生。

## 实现位置
- 页面入口：`app/(mini)/mini/teacher/data/page.tsx`
- 学生看板与子 Tabs：`components/mini/teacher/data-dashboard-panel.tsx`

## 三者核心差异（信息组织维度）
- 时间轴：以“时间/批次”为主线呈现错题发生与沉淀过程（原型当前直接使用错题列表的 createdAt 展示，未做真正聚合）。
- 错题：以“题目/错题条目”为主线，便于逐题复盘、讲评与形成练习清单。
- 薄弱点：以“知识点”为主线，对错题按 knowledgePoint 聚合并计数，便于诊断能力短板与制定补弱计划。

## 数据源口径（原型现状）
- 三个子 Tab 均基于 `getWrongQuestionsByStudent(studentId)`。
- “薄弱点”是在错题数据上做聚合得到；因此本质为“错题驱动的薄弱点”，不是综合正确率/掌握度模型。

## 设计取舍
- 学生看板未复用整体看板的“时间范围”筛选，避免口径误解（学生侧目前默认展示该学生全量错题记录）。
