import { notFound } from 'next/navigation'

import { StudentListPanel } from '@/components/mini/teacher/student-list-panel'
import { getClassById, getStudentsByClassId } from '@/lib/mock/queries'

export default async function TeacherClassStudentsPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  const students = getStudentsByClassId(classId)

  return <StudentListPanel classId={classId} students={students} />
}

