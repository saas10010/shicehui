import { notFound } from 'next/navigation'

import { MiniGradingConfirmPanel } from '@/components/mini/teacher/grading-confirm-panel'
import { getBatchById, getBatchStudentItems, getClassById } from '@/lib/mock/queries'

export default async function TeacherMiniGradingConfirmPage({
  params,
}: {
  params: Promise<{ classId: string; batchId: string }>
}) {
  const { classId, batchId } = await params
  const classInfo = getClassById(classId)
  const batch = getBatchById(batchId)
  if (!classInfo || !batch || batch.classId !== classId) notFound()

  const items = getBatchStudentItems(batchId)
  return <MiniGradingConfirmPanel classId={classId} batchId={batchId} items={items} />
}

