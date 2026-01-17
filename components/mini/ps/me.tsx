'use client'

import Link from 'next/link'
import type { MiniRole } from '@/lib/mini/ps'
import { roleLabel } from '@/lib/mini/ps'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export function MiniMe({ role }: { role: MiniRole }) {
  return (
    <div className="space-y-4">
      <WechatCard>
        <WechatCell
          title={`当前：${roleLabel(role)}`}
          description="原型：不接入真实账号体系"
          right={<WechatTag tone="success">演示</WechatTag>}
        />
        <WechatDivider />
        <WechatCell
          title="切换角色"
          description="教师/家长/学生"
          href="/mini"
        />
        <WechatDivider />
        <WechatCell
          title="回到入口页"
          description="教师端入口 + 小程序入口"
          href="/"
        />
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：此处可加入“设置/缓存/问题反馈”等。
        </div>
      </WechatCard>
    </div>
  )
}

