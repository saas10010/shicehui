'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

import type { Student } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function StudentList({ students }: { students: Student[] }) {
  const [query, setQuery] = React.useState('')
  const normalized = query.trim()

  const filtered = React.useMemo(() => {
    if (!normalized) return students
    return students.filter((s) => {
      const hay = `${s.name} ${s.code}`.toLowerCase()
      return hay.includes(normalized.toLowerCase())
    })
  }, [students, normalized])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索姓名/编号"
            className="pl-9 border-2 border-black rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          onClick={() => setQuery('')}
          disabled={!query}
        >
          清空
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/students/${s.id}`}
            className={cn(
              'rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform',
            )}
          >
            <div className="text-lg font-black">
              {s.name}{' '}
              <span className="text-sm text-muted-foreground">#{s.code}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              作业本请写姓名/学号，拍照采集后自动识别归档（原型）
            </div>
            <div className="mt-3 text-sm font-bold underline underline-offset-4">
              打开学生档案 →
            </div>
          </Link>
        ))}
      </div>

      {!filtered.length && (
        <div className="rounded-2xl border-4 border-black bg-white/60 p-6 text-center text-sm font-bold">
          未找到匹配的学生
        </div>
      )}
    </div>
  )
}
