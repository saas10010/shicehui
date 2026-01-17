# 批改确认页：确认保存 + 撤销确认（原型）

## 目标
- 点击「确认保存」后：停留在当前学生，toast 提示已保存；左侧列表状态变为「已确认」。
- 老师可反悔：提供「撤销确认」入口，撤销后可继续修改并再次保存。

## 实现
- `components/status-badge.tsx`
  - 新增状态值「已确认」，样式按默认（与“已完成/可确认”一致）。
- `components/grading/grading-confirm-panel.tsx`
  - 新增 `confirmedStudentIds:Set<string>` 作为“已确认”演示状态。
  - 「确认保存」：把当前学生加入 `confirmedStudentIds`，toast 提示；并将当前学生从批量选择集合移除。
  - 「撤销确认」：从 `confirmedStudentIds` 移除当前学生，toast 提示后允许继续编辑。
  - 已确认时锁定编辑：题目对错/分数/评语输入禁用，并在题目区提示需先撤销确认。
  - 为了演示“保存”效果可见：用 `draftEditsRef` 在切换学生时保留每位学生的编辑内容（本地、非持久化）。

## 说明
- 所有“确认/撤销/编辑内容”均为原型态，不落库、不跨刷新持久化。