# mini 教师端巩固中心：去掉“当前范围”展示

## 背景
- 个人册子/全班题单的“时间范围”下拉已能表达当前选择，非 custom 时再显示“当前范围”属于重复信息。

## 改动
- `components/mini/teacher/materials-panel.tsx`
  - 移除非 `custom` 时的“当前范围”展示块。
  - 当 `range !== 'custom'` 时，时间范围这一行改为单列布局；仅在 `custom` 时展示日期输入。 

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。