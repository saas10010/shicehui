import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import {
  MiniClassReinforceCell,
  MiniClassStudentImportCell,
} from '@/components/mini/teacher/class-management-panel'
import { getClassById } from '@/lib/mock/queries'

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const classInfo = getClassById(classId)
  if (!classInfo) notFound()

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">{classInfo.name}</div>
            <div className="mt-1 text-xs text-black/50">
              {classInfo.grade} · {classInfo.subject} · 学生 {classInfo.studentCount} 人
            </div>
          </div>
          <WechatTag tone="default">班级</WechatTag>
        </div>

        <div className="mt-3">
          <Link href="/mini/teacher/classes" className="text-sm text-[#07c160]">
            ← 返回班级列表
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        <MiniClassStudentImportCell />
        <WechatDivider />
        <WechatCell
          title="学生列表"
          description="搜索学生、进入学生档案"
          href={`/mini/teacher/classes/${classId}/students`}
        />
        <WechatDivider />
        <WechatCell
          title="作业批次"
          description="批次详情、异常处理、批改确认"
          href={`/mini/teacher/classes/${classId}/batches`}
        />
        <WechatDivider />
        <WechatCell
          title="数据看板"
          description="题目/知识点排行"
          href={`/mini/teacher/data?classId=${encodeURIComponent(classId)}`}
        />
        <WechatDivider />
        <MiniClassReinforceCell classId={classId} />
      </WechatCard>
    </div>
  )
}
