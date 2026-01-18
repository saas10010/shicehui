import { notFound } from 'next/navigation'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { getClassById, getStudentsByClassId } from '@/lib/mock/queries'

export default async function TeacherClassQRCodesPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  const students = getStudentsByClassId(classId)

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">二维码下载/打印</div>
            <div className="mt-1 text-xs text-black/50">
              目标：为每个学生生成唯一二维码，用于连拍归档（FR2）。班级：{classInfo.name}
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>
      </WechatCard>

      <WechatCard className="p-4 space-y-3">
        <a
          href={`/api/qrcodes/a4?classId=${encodeURIComponent(classId)}`}
          className="block rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90"
        >
          下载 A4 打印版（原型）
        </a>
        <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-black/60">
          <div className="font-medium text-black">打印指引（原型）</div>
          <ul className="mt-2 list-disc pl-5">
            <li>建议 A4 不干胶贴纸打印，保证二维码清晰不反光。</li>
            <li>拍摄时尽量让二维码入镜，缺码会进入异常池待处理。</li>
            <li>支持补打：建议记录打印时间与班级信息。</li>
          </ul>
        </div>
      </WechatCard>

      <WechatCard>
        {students.slice(0, 12).map((s, idx) => (
          <div key={s.id}>
            <WechatCell
              title={`${s.name}（#${s.code}）`}
              description={`二维码值：${s.qrCodeValue}`}
              right={<WechatTag tone="default">下载</WechatTag>}
              href={`/api/qrcodes/single?studentId=${encodeURIComponent(s.id)}`}
            />
            {idx === Math.min(12, students.length) - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!students.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无学生数据
          </div>
        ) : null}
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：真实系统应输出二维码图片与 A4 排版 PDF。
        </div>
      </WechatCard>
    </div>
  )
}

