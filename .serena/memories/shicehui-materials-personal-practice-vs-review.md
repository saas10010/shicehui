# /materials 个人资料：练习册与复习册差异化

## 目标
- 将“个人练习册/复习册”从单一入口拆分为两种产物，并在 UI 与下载内容中体现差异。

## 主要改动
- `lib/mock/types.ts`
  - `PdfJobType` 扩展为：`全班易错题单 | 个人练习册 | 个人复习册 | 个人练习册/复习册`（保留旧类型兼容本地历史记录）。
  - `PdfJob` 增加可选字段 `outline?: string[]`。

- `components/materials/materials-center.tsx`
  - 个人资料 Tab 增加产物切换：`个人练习册` 与 `个人复习册`。
  - 两种产物展示不同“定位文案 + 内容大纲”，并设置不同默认时间范围：
    - 练习册默认 `最近7天`
    - 复习册默认 `最近30天`
  - 创建任务时写入 `PdfJob.type` 与 `PdfJob.outline`，下载链接携带 `type/target/range/outline` 参数，使下载文件内容可见差异。

- `app/api/materials/pdf/route.ts`
  - 读取 query 参数 `type/target/range/outline`，在返回的占位文本中输出对应信息与大纲列表。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。
