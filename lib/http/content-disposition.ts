function sanitizeAsciiFilename(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * 构造可兼容中文文件名的下载响应头（避免 Node/Undici 的 ByteString 限制）。
 *
 * - `filename`：提供 ASCII 兜底，确保 Header 合法
 * - `filename*`：提供 UTF-8 真实文件名（RFC 5987 / RFC 6266）
 */
export function buildAttachmentContentDisposition(options: {
  utf8Filename: string
  fallbackFilename: string
}) {
  const utf8Filename = options.utf8Filename.replace(/[\r\n]+/g, ' ').trim()
  const fallbackFilename =
    sanitizeAsciiFilename(options.fallbackFilename) || 'download'
  const encodedUtf8Filename = encodeURIComponent(utf8Filename)

  return `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodedUtf8Filename}`
}

