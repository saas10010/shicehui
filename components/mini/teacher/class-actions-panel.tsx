'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export function MiniClassActionsPanel() {
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <WechatCard>
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
      <WechatDivider />
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
    </WechatCard>
  )
}

