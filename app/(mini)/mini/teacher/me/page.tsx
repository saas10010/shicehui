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
          title="作业"
          description="聚合查看各班批次进度与异常"
          href="/mini/teacher/homework"
        />
        <WechatDivider />
        <WechatCell
          title="数据看板"
          description="题目/知识点排行与样例数据"
          href="/mini/teacher/data"
        />
        <WechatDivider />
        <WechatCell
          title="巩固中心"
          description="题单与册子 / 历史错题 / 错题变体"
          href="/mini/teacher/reinforce"
        />
        <WechatDivider />
        <WechatCell
          title="设置"
          description="偏好开关与缓存清理（原型）"
          href="/mini/teacher/settings"
        />
        <WechatDivider />
        <WechatCell
          title="回到入口页"
          description="小程序角色选择入口"
          href="/"
        />
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：客户已确认仅保留小程序端；教师端完整功能在小程序信息架构内闭环。
        </div>
      </WechatCard>
    </div>
  )
}
