'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { MINI_QUEUE_STORAGE_KEY } from '@/lib/mini/queue'

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 忽略
  }
}

export function MiniSettingsPanel() {
  const [autoArchive, setAutoArchive] = React.useState(true)
  const [showEvidence, setShowEvidence] = React.useState(true)

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">设置</div>
            <div className="mt-1 text-xs text-black/50">
              原型：用于演示偏好开关与安全提示（非完整权限体系）。
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="自动归档"
          description="上传后自动识别姓名/学号并归档到学生（FR4）"
          right={
            <label className="flex items-center gap-2 text-xs text-black/60">
              <input
                type="checkbox"
                checked={autoArchive}
                onChange={(e) => setAutoArchive(e.target.checked)}
              />
              {autoArchive ? '开' : '关'}
            </label>
          }
        />
        <WechatDivider />
        <WechatCell
          title="证据视图"
          description="批改确认中展示图片证据与可追溯信息"
          right={
            <label className="flex items-center gap-2 text-xs text-black/60">
              <input
                type="checkbox"
                checked={showEvidence}
                onChange={(e) => setShowEvidence(e.target.checked)}
              />
              {showEvidence ? '开' : '关'}
            </label>
          }
        />
        <WechatDivider />
        <WechatCell
          title="保存"
          description="保存偏好设置（原型未持久化）"
          onClick={() => toast.success('已保存设置（原型）')}
          right={<WechatTag tone="success">按钮</WechatTag>}
        />
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="清理本地缓存（原型）"
          description="清理队列/资料生成记录等本地数据"
          onClick={() => {
            const confirmed = window.confirm('确认清理本地缓存？该操作仅影响当前浏览器的原型数据。')
            if (!confirmed) return
            safeRemove(MINI_QUEUE_STORAGE_KEY)
            safeRemove('shicehui:pdfJobs')
            toast.success('已清理本地缓存（原型）')
          }}
          right={<WechatTag tone="warning">谨慎</WechatTag>}
        />
      </WechatCard>
    </div>
  )
}
