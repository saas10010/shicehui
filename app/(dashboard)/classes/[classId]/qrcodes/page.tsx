import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Button } from '@/components/ui/button'
import { getClassById, getStudentsByClassId } from '@/lib/mock/queries'

export default function ClassQRCodesPage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  const students = getStudentsByClassId(classId)

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <h2 className="text-xl font-black">二维码下载/打印</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          目标：为每个学生生成唯一二维码，贴到作业本上，用于连拍归档（FR2）。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            asChild
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <a href={`/api/qrcodes/a4?classId=${classId}`}>
              下载 A4 打印版（原型）
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Link href={`/classes/${classId}/students`}>查看学生列表</Link>
          </Button>
        </div>

        <div className="mt-4 rounded-xl border-2 border-black bg-white/60 p-3 text-sm">
          <div className="font-bold">打印指引（原型）</div>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            <li>建议 A4 不干胶贴纸打印，保证二维码清晰不反光。</li>
            <li>拍摄时尽量让二维码入镜，缺码会进入异常池待处理。</li>
            <li>支持补打：建议记录打印时间与班级信息。</li>
          </ul>
        </div>
      </BrutalCard>

      <BrutalCard className="p-5">
        <h3 className="text-lg font-black">单个二维码（预览）</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          点击学生可下载单个二维码（原型以文本/占位输出）。
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.slice(0, 6).map((s) => (
            <a
              key={s.id}
              href={`/api/qrcodes/single?studentId=${s.id}`}
              className="rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform"
            >
              <div className="text-lg font-black">
                {s.name}{' '}
                <span className="text-sm text-muted-foreground">#{s.code}</span>
              </div>
              <div className="mt-3 rounded-xl border-2 border-black bg-white p-3">
                <div className="text-xs text-muted-foreground">二维码值</div>
                <div className="mt-1 text-sm font-bold">{s.qrCodeValue}</div>
              </div>
              <div className="mt-3 text-sm font-bold underline underline-offset-4">
                下载单个二维码 →
              </div>
            </a>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          原型说明：真实系统应输出二维码图片与 A4 排版 PDF。
        </div>
      </BrutalCard>
    </div>
  )
}

