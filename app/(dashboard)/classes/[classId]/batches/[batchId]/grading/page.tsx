import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { GradingConfirmPanel } from '@/components/grading/grading-confirm-panel'
import {
  getBatchById,
  getBatchStudentItems,
  getClassById,
} from '@/lib/mock/queries'

export default async function GradingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string; batchId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { classId, batchId } = await params
  const sp = (await searchParams) ?? {}
  const requestedStudentId =
    typeof sp.studentId === 'string'
      ? sp.studentId
      : Array.isArray(sp.studentId)
        ? sp.studentId[0]
        : undefined
  const classInfo = getClassById(classId)
  const batch = getBatchById(batchId)
  if (!classInfo || !batch || batch.classId !== classId) notFound()

  const items = getBatchStudentItems(batchId)

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link
                href={`/classes/${classId}/batches/${batchId}`}
                className="underline underline-offset-4"
              >
                返回批次详情
              </Link>
            </div>
            <h1 className="text-2xl font-black">批改确认</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              对批改初稿进行低成本纠错与确认，形成最终批改记录（FR6/FR7）。
            </p>
          </div>
          <div className="text-sm font-bold">
            {classInfo.name} · {batch.createdAt}
          </div>
        </div>
      </BrutalCard>

      <GradingConfirmPanel
        batchId={batchId}
        items={items}
        defaultStudentId={requestedStudentId}
      />
    </div>
  )
}
