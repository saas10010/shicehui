import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { StatusBadge } from '@/components/status-badge'
import { getBatchesByClassId, getClassById } from '@/lib/mock/queries'

function statusLabel(status: 'processing' | 'ready' | 'needs_attention') {
  if (status === 'ready') return '已完成'
  if (status === 'needs_attention') return '待处理'
  return '处理中'
}

export default async function ClassBatchesPage({
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
      <BrutalCard className="p-5">
        <h2 className="text-xl font-black">作业批次</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按“批次”查看归档与识别结果，可筛选异常并批量修正（FR4/FR5）。
        </p>
      </BrutalCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {batches.map((b) => (
          <Link
            key={b.id}
            href={`/classes/${classId}/batches/${b.id}`}
            className="block"
          >
            <BrutalCard className="p-5 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black">{b.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {b.createdAt} · {b.source}
                  </div>
                </div>
                <StatusBadge status={statusLabel(b.status)} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border-2 border-black bg-white/60 p-3">
                  <div className="text-muted-foreground">总数</div>
                  <div className="mt-1 text-lg font-black">{b.totalImages}</div>
                </div>
                <div className="rounded-xl border-2 border-black bg-white/60 p-3">
                  <div className="text-muted-foreground">已处理</div>
                  <div className="mt-1 text-lg font-black">
                    {b.processedImages}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-black bg-white/60 p-3">
                  <div className="text-muted-foreground">异常</div>
                  <div className="mt-1 text-lg font-black">
                    {b.exceptionImages}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm font-bold underline underline-offset-4">
                打开批次详情 →
              </div>
            </BrutalCard>
          </Link>
        ))}
      </div>

      {!batches.length && (
        <BrutalCard className="p-6 text-center">
          <div className="text-lg font-black">暂无批次</div>
          <div className="mt-2 text-sm text-muted-foreground">
            原型提示：连拍采集产生批次后，此处会展示归档进度与异常数量。
          </div>
        </BrutalCard>
      )}
    </div>
  )
}
