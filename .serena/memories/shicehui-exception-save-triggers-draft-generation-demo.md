# 异常归属保存后“生成初稿”演示（第 3 步）

## 目标
- 在原型中演示：异常归属保存后，系统对受影响学生触发“重算/补算初稿”，表现为「生成中 → 可确认」。

## 实现
- 生成状态使用 `sessionStorage` 跨页面共享：key = `shicehui:draft-generation:${batchId}`，value 为 `{ [studentId]: { readyAt } }`。
- `components/batches/batch-detail-tabs.tsx`
  - 点击「保存修正」时：
  - 合并 `saved + selected` 作为最终归属（允许部分保存，用于演示流程）
  - 若本次保存的归属条目数 > 0：toast 提示并触发相关学生的“生成中 → 可确认”演示
  - 将这些学生标为「生成中」，并写入 `readyAt`；到期自动切换为「可确认」并清理 storage。
- `components/grading/grading-confirm-panel.tsx`
  - 读取同一份 `sessionStorage` 生成状态：
    - 学生列表状态徽标可显示「生成中」
    - 右侧详情在「生成中/处理中」时展示 Skeleton，ready 后恢复可确认内容。

## 说明
- 该演示仅用于交互表达：不改后端、不持久化，刷新后状态会丢失（但同 tab 路由跳转可继承）。