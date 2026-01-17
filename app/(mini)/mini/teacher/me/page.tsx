import Link from 'next/link'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export default function TeacherMePage() {
  return (
    <div className="space-y-4">
      <WechatCard>
        <WechatCell
          title="教师（原型）"
          description="演示账号：无需登录"
          right={<WechatTag tone="success">已绑定</WechatTag>}
        />
        <WechatDivider />
        <WechatCell
          title="回到入口页"
          description="教师端入口 + 小程序原型入口"
          href="/"
        />
        <WechatDivider />
        <WechatCell
          title="打开教师端 Web"
          description="班级/批次/批改确认/看板/资料"
          href="/classes"
        />
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：此处可放置设置、缓存清理、问题反馈等入口。
        </div>
      </WechatCard>
    </div>
  )
}

