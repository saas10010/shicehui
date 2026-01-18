'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { WechatCard, WechatCell, WechatTag } from '@/components/mini/wechat-shell'

export function MiniClassActionsPanel({ embedded = false }: { embedded?: boolean }) {
  const cell = (
    <WechatCell
      title="创建班级"
      description="原型：创建后不持久化，仅演示交互"
      right={<WechatTag tone="default">原型</WechatTag>}
      onClick={() => {
        const name = window.prompt('请输入班级名称（原型）', '七年级1班')?.trim() ?? ''
        if (!name) {
          toast.message('已取消创建（原型）')
          return
        }
        const subject = window.prompt('请输入学科（可选）', '数学')?.trim() ?? ''
        toast.success(`已创建班级：${name}${subject ? ` · ${subject}` : ''}（原型未持久化）`)
      }}
    />
  )

  if (embedded) return cell
  return <WechatCard>{cell}</WechatCard>
}
