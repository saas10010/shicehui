import { WechatCard, WechatCell, WechatDivider, WechatPage, WechatTag } from '@/components/mini/wechat-shell'

export default function MiniRoleSwitchPage() {
  return (
    <WechatPage title="师策汇小程序原型">
      <WechatCard>
        <WechatCell
          title="教师端"
          description="连拍采集 → 上传队列 → 班级/作业/批次 → 异常处理 → 批改确认 → 看板/档案 → 巩固中心"
          right={<WechatTag tone="success">演示</WechatTag>}
          href="/mini/teacher/capture"
        />
        <WechatDivider />
        <WechatCell
          title="家长端"
          description="结果列表 → 结果详情 → 资料下载"
          right={<WechatTag tone="default">演示</WechatTag>}
          href="/mini/ps/results?role=parent"
        />
        <WechatDivider />
        <WechatCell
          title="学生端"
          description="资料下载（历史错题/错题变体）"
          right={<WechatTag tone="default">演示</WechatTag>}
          href="/mini/ps/materials?role=student"
        />
      </WechatCard>

      <div className="mt-4 text-xs text-black/50">
        说明：本原型使用 Next.js 模拟微信小程序的“信息架构与交互状态”，不接入真实相机/离线存储/上传 SDK。
      </div>
    </WechatPage>
  )
}
