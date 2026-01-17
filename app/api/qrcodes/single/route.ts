import { NextResponse } from 'next/server'

import { getStudentById } from '@/lib/mock/queries'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId') ?? ''
  const student = getStudentById(studentId)
  if (!student) {
    return new NextResponse('学生不存在', { status: 404 })
  }

  const content = `学生：${student.name}（#${student.code}）\n二维码值：${student.qrCodeValue}\n\n说明：原型占位输出，真实系统应输出二维码图片。`
  return new NextResponse(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="${student.name}-qrcode-prototype.txt"`,
    },
  })
}

