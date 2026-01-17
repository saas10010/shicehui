import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { StudentList } from '@/components/students/student-list'
import { getClassById, getStudentsByClassId } from '@/lib/mock/queries'

export default async function ClassStudentsPage({
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
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black">学生列表</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              支持搜索/分页（原型：仅演示搜索）。从这里可进入学生档案、检查二维码绑定状态。
            </p>
          </div>
          <div className="text-sm font-bold">
            共 {students.length} 人（原型示例数据）
          </div>
        </div>
      </BrutalCard>

      <StudentList students={students} />
    </div>
  )
}
