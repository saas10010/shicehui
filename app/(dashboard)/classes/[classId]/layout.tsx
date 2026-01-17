import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { ClassSubnav } from '@/components/classes/class-subnav'
import { getClassById } from '@/lib/mock/queries'

export default function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { classId: string }
}) {
  const { classId } = params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">班级</div>
            <h1 className="text-2xl font-black">
              {classInfo.name} · {classInfo.subject}
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {classInfo.grade} · {classInfo.studentCount} 人
            </div>
          </div>
          <ClassSubnav classId={classId} />
        </div>
      </BrutalCard>

      {children}
    </div>
  )
}
