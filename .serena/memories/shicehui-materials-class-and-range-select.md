# /materials 资料中心：班级与时间范围改为下拉选择

## 背景/问题
- 原 `components/materials/materials-center.tsx` 中：
  - “班级”使用 `Input` 可自由输入
  - “时间范围”使用 `Input` 可自由输入，默认仅展示“最近7天”但不受限
- 这会导致口径不统一、易误输，且与 `/data` 的“预设范围 + 自定义日期”交互不一致。

## 改动
- 班级：改为 `Select` 下拉，数据源使用 `lib/mock/data.ts` 的 `CLASSES`，默认选中第一个班级（通常是 `c-7-1`）。
- 时间范围：改为 `Select` 预设：`最近7天(默认)`、`最近30天`、`全部`、`自定义`。
- 自定义范围：选择 `custom` 后展示两个 `type=date` 输入（开始/结束），并在生成前做校验：
  - 起止日期不能为空
  - 开始日期不能晚于结束日期
- 生成记录：`PdfJob.rangeLabel` 统一保存为可读 label（如 `最近7天` / `自定义：YYYY-MM-DD ~ YYYY-MM-DD`）。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。
