import { notFound } from 'next/navigation'

import { BatchDetailPanel } from '@/components/mini/teacher/batch-detail-panel'
import {
  getBatchById,
  getBatchExceptions,
  getBatchStudentItems,
  getClassById,
  getStudentsByClassId,
} from '@/lib/mock/queries'

export default async function TeacherMiniBatchDetailPage({
  params,
}: {
  params: Promise<{ classId: string; batchId: string }>
}) {
  const { classId, batchId } = await params
  const classInfo = getClassById(classId)
  const batch = getBatchById(batchId)
  if (!classInfo || !batch || batch.classId !== classId) notFound()

  const students = getStudentsByClassId(classId)
  const studentItems = getBatchStudentItems(batchId)
  const exceptions = getBatchExceptions(batchId)

  return (
    <BatchDetailPanel
      classId={classId}
      batch={batch}
      students={students}
      studentItems={studentItems}
      exceptions={exceptions}
    />
  )
}

