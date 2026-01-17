import Link from 'next/link'

import { getClasses } from '@/lib/mock/queries'
import { BrutalCard } from '@/components/brutal/brutal-card'
import { ClassActions } from '@/components/classes/class-actions'
import { StatusBadge } from '@/components/status-badge'

export default function ClassesPage() {
  const classes = getClasses()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">班级列表</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            入口：建班 → 导入 → 下载二维码 → 连拍归档 → 批改确认 → 看板/档案 → 资料生成
          </p>
        </div>
        <ClassActions />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <Link key={c.id} href={`/classes/${c.id}`} className="block">
            <BrutalCard className="p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-black">{c.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {c.grade} · {c.subject}
                  </div>
                </div>
                <StatusBadge status="已完成" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border-2 border-black bg-white/60 p-3">
                  <div className="text-muted-foreground">学生数</div>
                  <div className="mt-1 text-lg font-black">{c.studentCount}</div>
                </div>
                <div className="rounded-xl border-2 border-black bg-white/60 p-3">
                  <div className="text-muted-foreground">最近批改</div>
                  <div className="mt-1 text-xs font-bold">{c.lastGradedAt ?? '—'}</div>
                </div>
              </div>

              <div className="mt-4 text-sm font-bold underline underline-offset-4">
                进入班级 →
              </div>
            </BrutalCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

