import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { BatchDetailTabs } from '@/components/batches/batch-detail-tabs'
import {
  getBatchById,
  getBatchExceptions,
  getBatchStudentItems,
  getClassById,
  getStudentsByClassId,
} from '@/lib/mock/queries'

export default function BatchDetailPage({
  params,
}: {
  params: { classId: string; batchId: string }
}) {
  const { classId, batchId } = params
  const classInfo = getClassById(classId)
  const batch = getBatchById(batchId)
  if (!classInfo || !batch || batch.classId !== classId) notFound()

  const students = getStudentsByClassId(classId)
  const studentItems = getBatchStudentItems(batchId)
  const exceptions = getBatchExceptions(batchId)

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black">批次详情</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              批次信息条：时间、来源、总数、异常数、处理进度（UI/UX 4.2.5）。
            </p>
          </div>
          <div className="text-sm font-bold">
            {batch.createdAt} · {batch.source}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border-2 border-black bg-white/60 p-3">
            <div className="text-muted-foreground">总数</div>
            <div className="mt-1 text-lg font-black">{batch.totalImages}</div>
          </div>
          <div className="rounded-xl border-2 border-black bg-white/60 p-3">
            <div className="text-muted-foreground">已处理</div>
            <div className="mt-1 text-lg font-black">
              {batch.processedImages}
            </div>
          </div>
          <div className="rounded-xl border-2 border-black bg-white/60 p-3">
            <div className="text-muted-foreground">异常</div>
            <div className="mt-1 text-lg font-black">
              {batch.exceptionImages}
            </div>
          </div>
        </div>
      </BrutalCard>

      <BatchDetailTabs
        classId={classId}
        batchId={batchId}
        students={students}
        studentItems={studentItems}
        exceptions={exceptions}
      />
    </div>
  )
}

