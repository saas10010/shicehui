import { NextResponse } from 'next/server'

import { getClassById, getStudentsByClassId } from '@/lib/mock/queries'
import { buildAttachmentContentDisposition } from '@/lib/http/content-disposition'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const classId = url.searchParams.get('classId') ?? ''
  const classInfo = getClassById(classId)
  if (!classInfo) {
    return new NextResponse('班级不存在', { status: 404 })
  }

  const students = getStudentsByClassId(classId)
  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${classInfo.name} - 二维码打印版（原型）</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; padding: 24px; }
      h1 { margin: 0 0 8px; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
      .card { border: 3px solid #000; padding: 12px; border-radius: 12px; }
      .name { font-weight: 800; }
      .code { margin-top: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      .hint { margin-top: 12px; color: #555; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>${classInfo.name}｜二维码打印版（原型）</h1>
    <div class="hint">说明：本原型不生成真实二维码图，仅输出二维码值用于演示下载/打印流程。</div>
    <div class="grid">
      ${students
        .map(
          (s) => `
          <div class="card">
            <div class="name">${s.name}（#${s.code}）</div>
            <div class="code">${s.qrCodeValue}</div>
          </div>
        `,
        )
        .join('')}
    </div>
  </body>
</html>`

  const response = new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-disposition': buildAttachmentContentDisposition({
        utf8Filename: `${classInfo.name}-qrcodes-prototype.html`,
        fallbackFilename: `class-${classId}-qrcodes-prototype.html`,
      }),
    },
  })
  return response
}
