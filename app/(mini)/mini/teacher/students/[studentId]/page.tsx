import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { getClassById, getStudentById, getWrongQuestionsByStudent } from '@/lib/mock/queries'

type Tab = 'timeline' | 'wrong' | 'weak'

function normalizeTab(v: string | undefined): Tab {
  if (v === 'wrong' || v === 'weak' || v === 'timeline') return v
  return 'timeline'
}

export default async function TeacherStudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { studentId } = await params
  const sp = (await searchParams) ?? {}
  const classIdFromQuery = typeof sp.classId === 'string' ? sp.classId : ''
  const tabFromQuery = typeof sp.tab === 'string' ? sp.tab : undefined
  const tab = normalizeTab(tabFromQuery)

  const student = getStudentById(studentId)
  if (!student) notFound()

  const classInfo = getClassById(student.classId)
  const wrongQuestions = getWrongQuestionsByStudent(studentId)

  const weakPoints = Object.entries(
    wrongQuestions.reduce<Record<string, number>>((acc, q) => {
      acc[q.knowledgePoint] = (acc[q.knowledgePoint] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([knowledgePoint, count]) => ({ knowledgePoint, count }))
    .sort((a, b) => b.count - a.count)

  const backHref = classIdFromQuery
    ? `/mini/teacher/classes/${encodeURIComponent(classIdFromQuery)}/students`
    : `/mini/teacher/classes/${encodeURIComponent(student.classId)}/students`

  const tabLink = (next: Tab) => {
    const params = new URLSearchParams()
    if (classIdFromQuery) params.set('classId', classIdFromQuery)
    params.set('tab', next)
    return `/mini/teacher/students/${encodeURIComponent(studentId)}?${params.toString()}`
  }

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">
              {student.name} <span className="text-xs text-black/40">#{student.code}</span>
            </div>
            <div className="mt-1 text-xs text-black/50">
              {classInfo?.name ?? '—'} · 学号：{student.code}
            </div>
          </div>
          <WechatTag tone="default">档案</WechatTag>
        </div>

        <div className="mt-3">
          <Link href={backHref} className="text-sm text-[#07c160]">
            ← 返回学生列表
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="生成个人资料"
          description="跳转到“题单与册子”，并默认选中该学生"
          href={`/mini/teacher/reinforce?tab=materials&studentId=${encodeURIComponent(student.id)}`}
        />
      </WechatCard>

      <WechatCard className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <Link
            href={tabLink('timeline')}
            className={`rounded-xl px-3 py-3 text-center text-sm font-semibold ${tab === 'timeline' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
          >
            时间轴
          </Link>
          <Link
            href={tabLink('wrong')}
            className={`rounded-xl px-3 py-3 text-center text-sm font-semibold ${tab === 'wrong' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
          >
            错题（{wrongQuestions.length}）
          </Link>
          <Link
            href={tabLink('weak')}
            className={`rounded-xl px-3 py-3 text-center text-sm font-semibold ${tab === 'weak' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
          >
            薄弱点
          </Link>
        </div>
      </WechatCard>

      {tab === 'timeline' ? (
        <WechatCard className="p-4 space-y-3">
          <div className="text-sm font-medium text-black">时间轴（原型）</div>
          <div className="text-xs text-black/50">
            按批次/日期聚合展示批改与错题沉淀（原型用错题时间替代完整批次记录）。
          </div>
          <div className="space-y-2">
            {wrongQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border border-black/10 bg-white p-3">
                <div className="text-sm font-medium text-black">{q.title}</div>
                <div className="mt-1 text-xs text-black/50">
                  {q.createdAt} · 知识点：{q.knowledgePoint} · 批次：{q.batchId}
                </div>
              </div>
            ))}
            {!wrongQuestions.length ? (
              <div className="py-10 text-center text-sm text-black/50">
                暂无错题记录
              </div>
            ) : null}
          </div>
        </WechatCard>
      ) : null}

      {tab === 'wrong' ? (
        <WechatCard className="p-4 space-y-3">
          <div className="text-sm font-medium text-black">错题列表</div>
          <div className="text-xs text-black/50">包含题目、时间、批次、知识点标签等字段（原型）。</div>
          <div className="space-y-2">
            {wrongQuestions.map((q, idx) => (
              <div key={q.id}>
                <WechatCell
                  title={q.title}
                  description={`知识点：${q.knowledgePoint} · 批次：${q.batchId} · ${q.createdAt}`}
                  right={<WechatTag tone="default">已完成</WechatTag>}
                />
                {idx === wrongQuestions.length - 1 ? null : <WechatDivider />}
              </div>
            ))}
            {!wrongQuestions.length ? (
              <div className="py-10 text-center text-sm text-black/50">
                暂无错题
              </div>
            ) : null}
          </div>
        </WechatCard>
      ) : null}

      {tab === 'weak' ? (
        <WechatCard className="p-4 space-y-3">
          <div className="text-sm font-medium text-black">薄弱点概览</div>
          <div className="text-xs text-black/50">按知识点聚合，按错误数量排序（原型）。</div>
          <div className="space-y-2">
            {weakPoints.map((w) => (
              <div key={w.knowledgePoint} className="rounded-xl border border-black/10 bg-white p-3">
                <div className="text-sm font-medium text-black">{w.knowledgePoint}</div>
                <div className="mt-1 text-xs text-black/50">错误次数：{w.count}</div>
              </div>
            ))}
            {!weakPoints.length ? (
              <div className="py-10 text-center text-sm text-black/50">
                暂无薄弱点数据
              </div>
            ) : null}
          </div>
        </WechatCard>
      ) : null}
    </div>
  )
}
