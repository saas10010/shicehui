'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { ClassInfo } from '@/lib/mock/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function HomeworkClassFilter({
  classes,
  value,
}: {
  classes: ClassInfo[]
  value: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function pushQuery(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams?.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasActiveFilter = value !== 'all'

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={value}
        onValueChange={(next) => {
          pushQuery({ classId: next === 'all' ? undefined : next })
        }}
      >
        <SelectTrigger className="h-10 w-44 border-2 border-black rounded-xl bg-white">
          <SelectValue placeholder="选择班级" />
        </SelectTrigger>
        <SelectContent className="border-2 border-black">
          <SelectItem value="all">全部班级</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        disabled={!hasActiveFilter}
        onClick={() => pushQuery({ classId: undefined })}
      >
        清除筛选
      </Button>
    </div>
  )
}

