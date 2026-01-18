import { notFound } from 'next/navigation'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { getBatchesByClassId, getClassById } from '@/lib/mock/queries'

function toneOfBatch(exceptionImages: number) {
  return exceptionImages > 0 ? 'warning' : 'success'
}

export default async function TeacherClassBatchesPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  const batches = getBatchesByClassId(classId)

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">作业批次</div>
        <div className="mt-1 text-xs text-black/50">
          班级：{classInfo.name}。支持：批次详情、异常处理、批改确认（原型）。
        </div>
      </WechatCard>

      <WechatCard>
        {batches.map((b, idx) => (
          <div key={b.id}>
            <WechatCell
              title={b.title}
              description={`${b.createdAt} · 异常 ${b.exceptionImages} · 已处理 ${b.processedImages}/${b.totalImages}`}
              right={<WechatTag tone={toneOfBatch(b.exceptionImages)}>{b.exceptionImages > 0 ? '有异常' : '正常'}</WechatTag>}
              href={`/mini/teacher/classes/${classId}/batches/${b.id}`}
            />
            {idx === batches.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!batches.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无批次数据
          </div>
        ) : null}
      </WechatCard>
    </div>
  )
}

