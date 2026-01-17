import Link from 'next/link'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { StatusBadge } from '@/components/status-badge'
import { getBatches, getClassById } from '@/lib/mock/queries'

function statusLabel(status: 'processing' | 'ready' | 'needs_attention') {
  if (status === 'ready') return '已完成'
  if (status === 'needs_attention') return '待处理'
  return '处理中'
}

export default function HomeworkPage() {
  const batches = getBatches()

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <h1 className="text-2xl sm:text-3xl font-black">作业</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          聚合查看各班级的作业批次进度与异常，点击进入批次详情进行处理与确认。
        </p>
      </BrutalCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => {
          const classInfo = getClassById(b.classId)
          return (
            <Link
              key={b.id}
              href={`/classes/${b.classId}/batches/${b.id}`}
              className="block"
            >
              <BrutalCard className="p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-black">{b.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {classInfo?.name ?? '未知班级'} · {b.createdAt} · {b.source}
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
          )
        })}
      </div>

      {!batches.length && (
        <BrutalCard className="p-6 text-center">
          <div className="text-lg font-black">暂无作业批次</div>
          <div className="mt-2 text-sm text-muted-foreground">
            原型提示：当班级产生作业批次后，这里会按时间展示最新进度。
          </div>
        </BrutalCard>
      )}
    </div>
  )
}
