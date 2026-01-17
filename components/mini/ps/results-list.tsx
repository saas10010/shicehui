'use client'

import Link from 'next/link'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import type { MiniRole } from '@/lib/mini/ps'
import { roleLabel } from '@/lib/mini/ps'

const mockResults = [
  {
    id: 'r-20260116',
    title: '2026-01-16 作业结果',
    summary: '本次错题 3 道 · 待完成练习 1',
    hasTask: true,
  },
  {
    id: 'r-20260115',
    title: '2026-01-15 作业结果',
    summary: '本次错题 2 道 · 待完成练习 0',
    hasTask: false,
  },
]

export function ResultsList({ role }: { role: MiniRole }) {
  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">作业结果列表</div>
            <div className="mt-1 text-xs text-black/50">
              当前角色：{roleLabel(role)}。入口：通知卡片 → 结果详情 → 下一步行动。
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>
      </WechatCard>

      <WechatCard>
        {mockResults.map((r, idx) => (
          <div key={r.id}>
            <WechatCell
              title={r.title}
              description={r.summary}
              right={
                <WechatTag tone={r.hasTask ? 'warning' : 'success'}>
                  {r.hasTask ? '有待办' : '已完成'}
                </WechatTag>
              }
              href={`/mini/ps/results/${r.id}?role=${role}`}
            />
            {idx === mockResults.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
      </WechatCard>

      <div className="text-xs text-black/50">
        原型说明：真实场景下，结果列表由系统推送/通知进入；每条卡片应包含时间、摘要与待办数。
      </div>

      <div className="text-xs text-black/50">
        需要回到角色切换？{' '}
        <Link href="/mini" className="text-[#07c160]">
          去切换
        </Link>
      </div>
    </div>
  )
}

