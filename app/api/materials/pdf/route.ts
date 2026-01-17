import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId') ?? ''
  const type = url.searchParams.get('type') ?? ''
  const target = url.searchParams.get('target') ?? ''
  const range = url.searchParams.get('range') ?? ''
  const outlineRaw = url.searchParams.get('outline') ?? ''
  const outline = outlineRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const lines: string[] = []
  lines.push('PDF 生成结果（原型占位）')
  lines.push(`任务ID：${jobId}`)
  if (type) lines.push(`类型：${type}`)
  if (target) lines.push(`对象：${target}`)
  if (range) lines.push(`时间范围：${range}`)
  if (outline.length) {
    lines.push('')
    lines.push('内容大纲：')
    for (const item of outline) lines.push(`- ${item}`)
  }
  lines.push('')
  lines.push('说明：真实系统应返回 PDF 文件（FR11/FR12）。')
  const content = lines.join('\n')

  return new NextResponse(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="shicehui-${jobId}-prototype.txt"`,
    },
  })
}
