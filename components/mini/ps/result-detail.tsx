'use client'

import Link from 'next/link'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import type { MiniRole } from '@/lib/mini/ps'
import { roleLabel } from '@/lib/mini/ps'

const mockWrong = [
  { id: 'w1', title: '一元一次方程（移项）', action: '去订正' },
  { id: 'w2', title: '整式加减（合并同类项）', action: '去练习' },
  { id: 'w3', title: '有理数运算（符号与括号）', action: '去查看解析' },
]

export function ResultDetail({
  role,
  resultId,
}: {
  role: MiniRole
  resultId: string
}) {
  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">结果详情</div>
            <div className="mt-1 text-xs text-black/50">
              当前角色：{roleLabel(role)} · 结果ID：{resultId}
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>

        <div className="mt-3">
          <Link href={`/mini/ps/results?role=${role}`} className="text-sm text-[#07c160]">
            ← 返回结果列表
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="错题入口"
          description="查看本次错题与解析"
          right={<WechatTag tone="warning">{mockWrong.length}</WechatTag>}
        />
        <WechatDivider />
        {mockWrong.map((w, idx) => (
          <div key={w.id}>
            <WechatCell
              title={w.title}
              description={`下一步：${w.action}`}
              right={<WechatTag tone="default">{w.action}</WechatTag>}
            />
            {idx === mockWrong.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="去资料下载"
          description="下载历史错题/错题变体（家长端）"
          right={<WechatTag tone="success">行动</WechatTag>}
          href={`/mini/ps/materials?role=${role}`}
        />
      </WechatCard>

    </div>
  )
}
