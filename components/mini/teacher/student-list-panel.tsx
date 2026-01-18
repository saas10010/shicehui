'use client'

import * as React from 'react'
import Link from 'next/link'

import type { Student } from '@/lib/mock/types'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export function StudentListPanel({
  classId,
  students,
}: {
  classId: string
  students: Student[]
}) {
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim()
    if (!q) return students
    return students.filter((s) => {
      return (
        s.name.includes(q) ||
        s.code.includes(q)
      )
    })
  }, [query, students])

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">学生列表</div>
            <div className="mt-1 text-xs text-black/50">
              支持搜索；点击学生进入档案。当前：{students.length} 人
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>

        <div className="mt-3">
          <Link
            href={`/mini/teacher/classes/${encodeURIComponent(classId)}`}
            className="text-sm text-[#07c160]"
          >
            ← 返回班级
          </Link>
        </div>

        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索：姓名 / 学号"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/30 outline-none focus:ring-2 focus:ring-[#07c160]/20"
          />
        </div>
      </WechatCard>

      <WechatCard>
        {filtered.map((s, idx) => (
          <React.Fragment key={s.id}>
            <WechatCell
              title={`${s.name}（#${s.code}）`}
              href={`/mini/teacher/students/${s.id}?classId=${encodeURIComponent(classId)}`}
            />
            {idx === filtered.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}

        {!filtered.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            未找到匹配的学生
          </div>
        ) : null}
      </WechatCard>
    </div>
  )
}
