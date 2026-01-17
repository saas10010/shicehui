import { NextResponse } from 'next/server'

import { getStudentById } from '@/lib/mock/queries'
import { buildAttachmentContentDisposition } from '@/lib/http/content-disposition'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const studentId = url.searchParams.get('studentId') ?? ''
  const student = getStudentById(studentId)
  if (!student) {
    return new NextResponse('学生不存在', { status: 404 })
  }

  const content = `学生：${student.name}（#${student.code}）\n二维码值：${student.qrCodeValue}\n\n说明：原型占位输出，真实系统应输出二维码图片。`
  const filenameUtf8 = `${student.name}-qrcode-prototype.txt`
  const filenameFallback = `student-${student.code}-qrcode-prototype.txt`
  return new NextResponse(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': buildAttachmentContentDisposition({
        utf8Filename: filenameUtf8,
        fallbackFilename: filenameFallback,
      }),
    },
  })
}
