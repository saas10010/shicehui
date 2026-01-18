'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { key: 'students', label: '学生', hrefSuffix: '/students' },
  { key: 'batches', label: '作业批次', hrefSuffix: '/batches' },
]

export function ClassSubnav({ classId }: { classId: string }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const href = `/classes/${classId}${item.hrefSuffix}`
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={item.key}
            href={href}
            className={cn(
              'rounded-xl border-2 border-black px-3 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
              active ? 'bg-black text-white' : 'bg-white/70 hover:bg-white',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
