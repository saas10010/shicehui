'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

import { WechatCard } from '@/components/mini/wechat-shell'
import { MiniMaterialsPanel } from '@/components/mini/teacher/materials-panel'
import { MiniTasksPanel } from '@/components/mini/teacher/tasks-panel'

type Tab = 'materials' | 'tasks'

function normalizeTab(v: string | null): Tab {
  return v === 'tasks' ? 'tasks' : 'materials'
}

export function MiniReinforcePanel({
  defaultTab = 'materials',
  defaultStudentId,
  }: {
    defaultTab?: Tab
    defaultStudentId?: string
  }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [tab, setTab] = React.useState<Tab>(defaultTab)

    const classIdFromQuery = searchParams.get('classId') ?? ''
    const studentIdFromQuery = searchParams.get('studentId') ?? ''
    const backHref = studentIdFromQuery
      ? `/mini/teacher/students/${encodeURIComponent(studentIdFromQuery)}${classIdFromQuery ? `?classId=${encodeURIComponent(classIdFromQuery)}` : ''}`
      : classIdFromQuery
        ? `/mini/teacher/classes/${encodeURIComponent(classIdFromQuery)}`
        : '/mini/teacher/classes'
    const backLabel = studentIdFromQuery
      ? '← 返回学生档案'
      : classIdFromQuery
        ? '← 返回班级'
        : '← 返回班级列表'

    React.useEffect(() => {
      const current = normalizeTab(searchParams.get('tab'))
      if (current === tab) return
      setTab(current)
  }, [searchParams, tab])

  const switchTab = (next: Tab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', next)
    router.replace(`/mini/teacher/reinforce?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">巩固中心</div>
        <div className="mt-1 text-xs text-black/50">
          题单与册子用于讲评/打印；练习任务用于提交与统计（原型）。
        </div>
        <div className="mt-3">
          <Link href={backHref} className="text-sm text-[#07c160]">
            {backLabel}
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${tab === 'materials' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
            onClick={() => switchTab('materials')}
          >
            题单与册子
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${tab === 'tasks' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
            onClick={() => switchTab('tasks')}
          >
            练习任务
          </button>
        </div>
      </WechatCard>

      {tab === 'materials' ? (
        <MiniMaterialsPanel defaultStudentId={defaultStudentId} />
      ) : (
        <MiniTasksPanel />
      )}
    </div>
  )
}
