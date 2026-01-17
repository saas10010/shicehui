import { notFound } from 'next/navigation'
import Link from 'next/link'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { ClassSubnav } from '@/components/classes/class-subnav'
import { Button } from '@/components/ui/button'
import { getClassById } from '@/lib/mock/queries'

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
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
          <div className="flex flex-col gap-2 md:items-end">
            <Button
              asChild
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Link href={`/data?classId=${encodeURIComponent(classId)}`}>
                进入班级看板
              </Link>
            </Button>
            <ClassSubnav classId={classId} />
          </div>
        </div>
      </BrutalCard>

      {children}
    </div>
  )
}
