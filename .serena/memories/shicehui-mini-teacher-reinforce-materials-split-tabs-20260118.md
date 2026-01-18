# mini 教师端巩固中心：题单与册子拆为双 Tab

## 动机
- 原“生成参数”把班级/学生/时间范围混在同一块，容易误导用户理解参数作用范围，也增加实现控制复杂度。

## 改动
- `components/mini/teacher/materials-panel.tsx`
  - 在“题单与册子”模块顶部新增双 Tab：`全班题单` / `个人册子`。
  - 参数区按 Tab 拆分：
    - 全班题单：仅展示班级 + 时间范围；按钮仅保留“生成全班题单”。
    - 个人册子：仅展示学生 + 时间范围；按钮为“生成历史错题/生成错题变体”。
  - 个人册子学生下拉：未锁班时展示全量学生（选项显示 `班级 · 姓名（#学号）`）；锁班时仅展示该班学生。
  - 继续保持：URL 带 `classId` 时锁定班级上下文（班级下拉禁用；个人册子也只看该班学生）。

- `components/mini/teacher/reinforce-panel.tsx`
  - 透传 `defaultMode`：URL 带 `studentId` 时默认进入“个人册子”，否则默认“全班题单”。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。