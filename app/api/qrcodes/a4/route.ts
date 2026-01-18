import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('该接口已下线：系统改为识别姓名/学号归档。', {
    status: 410,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
