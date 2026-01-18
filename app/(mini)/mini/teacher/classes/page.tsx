import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { MiniClassActionsPanel } from '@/components/mini/teacher/class-actions-panel'
import { getClasses } from '@/lib/mock/queries'

export default function TeacherClassesPage() {
  const classes = getClasses()

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">班级</div>
            <div className="mt-1 text-xs text-black/50">
              小程序端覆盖教师端完整功能项：班级/作业/批次/批改确认/看板/档案/巩固中心/设置。
            </div>
          </div>
          <WechatTag tone="success">已迁移</WechatTag>
        </div>
      </WechatCard>

      <MiniClassActionsPanel />

      <WechatCard>
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
          description="题单与册子 / 练习任务"
          href="/mini/teacher/reinforce"
        />
        <WechatDivider />
        <WechatCell
          title="设置"
          description="偏好开关与缓存清理（原型）"
          href="/mini/teacher/settings"
        />
      </WechatCard>

      <WechatCard>
        {classes.map((c, idx) => (
          <div key={c.id}>
            <WechatCell
              title={c.name}
              description={`${c.grade} · ${c.subject} · 学生 ${c.studentCount} 人`}
              right={<WechatTag tone="default">班级</WechatTag>}
              href={`/mini/teacher/classes/${c.id}`}
            />
            {idx === classes.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!classes.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无班级数据
          </div>
        ) : null}
      </WechatCard>
    </div>
  )
}
