# /mini/teacher/classes：将多个卡片合并为一个大卡片

## 目标
- 班级列表页原本由多个 `WechatCard` 组成（说明卡片、创建班级卡片、班级列表卡片）。
- 调整为单个大卡片承载全部内容，内部用 `WechatDivider` 分隔区块。

## 改动
- `components/mini/teacher/class-actions-panel.tsx`
  - `MiniClassActionsPanel` 新增 `embedded?: boolean` 参数。
  - `embedded=true` 时仅渲染 `WechatCell`，避免在外层大卡片内产生嵌套卡片。

- `app/(mini)/mini/teacher/classes/page.tsx`
  - 使用单个 `WechatCard className="p-0"` 包含：页头说明区 + 创建班级入口 + 班级列表。
  - 各区块之间使用 `WechatDivider` 分隔。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。