'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export function MiniClassStudentImportCell() {
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <>
      <WechatCell
        title="导入学生"
        description="原型：选择文件后模拟导入结果"
        right={<WechatTag tone="default">原型</WechatTag>}
        onClick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          toast.success(`导入完成：成功 38 条，失败 2 条（原型模拟）\n文件：${file.name}`)
          e.target.value = ''
        }}
      />
    </>
  )
}

export function MiniClassReinforceCell({ classId }: { classId: string }) {
  return (
    <WechatCell
      title="巩固中心"
      description="题单与册子 / 历史错题 / 错题变体（本班）"
      href={`/mini/teacher/reinforce?classId=${encodeURIComponent(classId)}`}
    />
  )
}

export function MiniClassManagementPanel({ classId }: { classId: string }) {
  return (
    <WechatCard>
      <MiniClassStudentImportCell />
      <WechatDivider />
      <MiniClassReinforceCell classId={classId} />
    </WechatCard>
  )
}
