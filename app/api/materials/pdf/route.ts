import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId') ?? ''
  const content = `PDF 生成结果（原型占位）\n任务ID：${jobId}\n\n说明：真实系统应返回 PDF 文件（FR11/FR12）。`

  return new NextResponse(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="shicehui-${jobId}-prototype.txt"`,
    },
  })
}

