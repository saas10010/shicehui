'use client'

import * as React from 'react'
import Link from 'next/link'

import type { MiniRole } from '@/lib/mini/ps'
import { roleLabel } from '@/lib/mini/ps'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

type PdfJob = {
  id: string
  type: string
  targetLabel: string
  rangeLabel: string
  status: string
  createdAt: string
}

const PDF_JOBS_KEY = 'shicehui:pdfJobs'

function loadJobs(): PdfJob[] {
  try {
    const raw = localStorage.getItem(PDF_JOBS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PdfJob[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function MiniMaterials({ role }: { role: MiniRole }) {
  const [jobs, setJobs] = React.useState<PdfJob[]>([])

  React.useEffect(() => {
    setJobs(loadJobs())
  }, [])

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">资料下载</div>
            <div className="mt-1 text-xs text-black/50">
              当前角色：{roleLabel(role)}。展示 PDF 列表与下载入口（原型占位文件）。
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>
      </WechatCard>

      <WechatCard>
        {jobs.map((j, idx) => (
          <div key={j.id}>
            <WechatCell
              title={`${j.type} · ${j.targetLabel}`}
              description={`${j.createdAt} · ${j.status} · 时间范围：${j.rangeLabel}`}
              right={
                <WechatTag tone={j.status === '已完成' ? 'success' : j.status === '失败' ? 'danger' : 'warning'}>
                  {j.status}
                </WechatTag>
              }
              href={j.status === '已完成' ? `/api/materials/pdf?jobId=${j.id}` : undefined}
            />
            {idx === jobs.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!jobs.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无记录（你可以先在教师端“题单与册子”生成一条记录）
          </div>
        ) : null}
      </WechatCard>

      <div className="text-xs text-black/50">
        <Link href="/materials" className="text-[#07c160]">
          去教师端生成资料 →
        </Link>
      </div>
    </div>
  )
}
