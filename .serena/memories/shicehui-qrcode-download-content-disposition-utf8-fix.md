# Next.js 15 下载接口 Content-Disposition 中文文件名修复

## 问题
- 点击“下载单个二维码”触发 500：
  - `TypeError: Cannot convert argument to a ByteString ... value > 255`
- 根因：在 `Content-Disposition` 里直接拼接中文文件名（如学生/班级名称），Node/Undici 的 Headers 对值有 ByteString 限制。

## 修复
- 新增工具函数 `buildAttachmentContentDisposition`：提供 ASCII 的 `filename` 兜底 + UTF-8 的 `filename*`（RFC 5987/6266）。
- 更新接口：
  - `app/api/qrcodes/single/route.ts`
  - `app/api/qrcodes/a4/route.ts`
- 兜底命名使用 `student-${code}` / `class-${classId}`，避免中文导致 Header 非法。

## 验证
- `npx tsc -p tsconfig.json --noEmit` 通过。