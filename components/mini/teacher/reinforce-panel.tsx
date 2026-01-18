'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

import { WechatCard, WechatDivider } from '@/components/mini/wechat-shell'
import { MiniMaterialsPanel } from '@/components/mini/teacher/materials-panel'

export function MiniReinforcePanel({
  defaultStudentId,
  }: {
    defaultStudentId?: string
  }) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const classIdFromQuery = searchParams.get('classId') ?? ''
    const studentIdFromQuery = searchParams.get('studentId') ?? ''
    const effectiveDefaultStudentId = studentIdFromQuery || defaultStudentId || undefined
    const defaultMode = studentIdFromQuery ? 'personal' : 'class'
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
      const current = searchParams.get('tab')
      if (!current || current === 'materials') return
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'materials')
      router.replace(`/mini/teacher/reinforce?${params.toString()}`, { scroll: false })
    }, [router, searchParams])

  return (
    <WechatCard className="p-0">
      <div className="p-4">
        <div className="text-sm font-medium text-black">巩固中心</div>
        <div className="mt-1 text-xs text-black/50">
          题单与册子用于讲评/打印；支持生成历史错题与错题变体（原型）。
        </div>
        <div className="mt-3">
          <Link href={backHref} className="text-sm text-[#07c160]">
            {backLabel}
          </Link>
        </div>
      </div>
      <WechatDivider />
      <MiniMaterialsPanel
        defaultClassId={classIdFromQuery || undefined}
        defaultStudentId={effectiveDefaultStudentId}
        defaultMode={defaultMode}
      />
    </WechatCard>
  )
}
