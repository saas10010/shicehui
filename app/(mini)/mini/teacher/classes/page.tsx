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
              本页仅支持创建班级与进入班级；班级内管理请进入对应班级详情页。
            </div>
          </div>
          <WechatTag tone="success">已迁移</WechatTag>
        </div>
      </WechatCard>

      <MiniClassActionsPanel />

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
