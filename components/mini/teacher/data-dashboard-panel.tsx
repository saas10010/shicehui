'use client'

import * as React from 'react'
import Link from 'next/link'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import {
  getClasses,
  getStudentsByClassId,
  getWrongQuestionsByClass,
  getWrongQuestionsByStudent,
} from '@/lib/mock/queries'
import type { WrongQuestion } from '@/lib/mock/types'

type DateRangePreset = '7d' | '30d' | 'all' | 'custom'

type MainTab = 'dashboard' | 'student'

type DashboardTab = 'question' | 'knowledge'

type StudentTab = 'timeline' | 'wrong' | 'weak'

type RankRow = {
  key: string
  title: string
  wrongCount: number
  errorRate: number
  students: { id: string; name: string }[]
  samples: { id: string; studentName: string; createdAt: string; errorRate: number; batchId: string }[]
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function parseCreatedAt(value: string) {
  // mock 数据格式：YYYY-MM-DD HH:mm
  const normalized = value.replace(' ', 'T')
  const parsed = new Date(`${normalized}:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDateOnly(date: Date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateOnly(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getReferenceNow(wrong: WrongQuestion[]) {
  let max: Date | null = null
  for (const q of wrong) {
    const dt = parseCreatedAt(q.createdAt)
    if (!dt) continue
    if (!max || dt.getTime() > max.getTime()) max = dt
  }
  return max ?? new Date()
}

function normalizeRangePreset(value: string): DateRangePreset {
  if (value === '7d' || value === '30d' || value === 'all' || value === 'custom') return value
  return '7d'
}

function filterWrongByRange({
  wrong,
  range,
  start,
  end,
}: {
  wrong: WrongQuestion[]
  range: DateRangePreset
  start: string
  end: string
}) {
  if (range === 'all') {
    return { filtered: wrong, rangeLabel: '全部' }
  }

  const referenceNow = getReferenceNow(wrong)

  if (range === 'custom') {
    const startDate = parseDateOnly(start)
    const endDate = parseDateOnly(end)
    if (!startDate || !endDate) {
      return { filtered: wrong, rangeLabel: '自定义（未填写，展示全部）' }
    }

    const startTs = startDate.getTime()
    const endTs = endDate.getTime() + 24 * 60 * 60 * 1000 - 1
    const filtered = wrong.filter((q) => {
      const dt = parseCreatedAt(q.createdAt)
      if (!dt) return false
      const ts = dt.getTime()
      return ts >= startTs && ts <= endTs
    })

    return { filtered, rangeLabel: `${start} 至 ${end}` }
  }

  const days = range === '30d' ? 30 : 7
  const cutoff = new Date(referenceNow.getTime() - days * 24 * 60 * 60 * 1000)
  const filtered = wrong.filter((q) => {
    const dt = parseCreatedAt(q.createdAt)
    return dt ? dt.getTime() >= cutoff.getTime() : false
  })

  return { filtered, rangeLabel: `最近${days}天（截止 ${formatDateOnly(referenceNow)}）` }
}

function aggregateToRankRows({
  wrong,
  keyOf,
  studentNameById,
}: {
  wrong: WrongQuestion[]
  keyOf: (q: WrongQuestion) => string
  studentNameById: Record<string, string>
}): RankRow[] {
  const map = new Map<
    string,
    {
      sum: number
      count: number
      studentIds: Set<string>
      samples: WrongQuestion[]
    }
  >()

  for (const q of wrong) {
    const key = keyOf(q)
    const prev = map.get(key) ?? { sum: 0, count: 0, studentIds: new Set<string>(), samples: [] }
    prev.sum += q.errorRate
    prev.count += 1
    prev.studentIds.add(q.studentId)
    if (prev.samples.length < 6) prev.samples.push(q)
    map.set(key, prev)
  }

  return [...map.entries()].map(([key, v]) => ({
    key,
    title: key,
    wrongCount: v.count,
    errorRate: clamp01(v.sum / Math.max(1, v.count)),
    students: [...v.studentIds].map((id) => ({ id, name: studentNameById[id] ?? id })),
    samples: v.samples.map((q) => ({
      id: q.id,
      studentName: studentNameById[q.studentId] ?? q.studentId,
      createdAt: q.createdAt,
      errorRate: q.errorRate,
      batchId: q.batchId,
    })),
  }))
}

function percentLabel(v: number) {
  return `${Math.round(v * 100)}%`
}

export function MiniDataDashboardPanel({
  defaultClassId,
}: {
  defaultClassId?: string
}) {
  const classes = React.useMemo(() => getClasses(), [])
  const [classId, setClassId] = React.useState(() => {
    if (defaultClassId && classes.some((c) => c.id === defaultClassId)) return defaultClassId
    return classes[0]?.id ?? ''
  })
  const [tab, setTab] = React.useState<MainTab>('dashboard')
  const [dashboardTab, setDashboardTab] = React.useState<DashboardTab>('question')
  const [range, setRange] = React.useState<DateRangePreset>('7d')
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const [studentId, setStudentId] = React.useState('')
  const [studentTab, setStudentTab] = React.useState<StudentTab>('timeline')

  const wrongAll = React.useMemo(() => {
    if (!classId) return []
    return getWrongQuestionsByClass(classId)
  }, [classId])

  const { filtered: wrong, rangeLabel } = React.useMemo(() => {
    return filterWrongByRange({ wrong: wrongAll, range, start, end })
  }, [end, range, start, wrongAll])

  const students = React.useMemo(() => {
    if (!classId) return []
    return getStudentsByClassId(classId)
  }, [classId])

  React.useEffect(() => {
    setStudentId((prev) => {
      if (prev && students.some((s) => s.id === prev)) return prev
      return students[0]?.id ?? ''
    })
  }, [students])

  const studentNameById = React.useMemo(() => {
    return students.reduce<Record<string, string>>((acc, s) => {
      acc[s.id] = s.name
      return acc
    }, {})
  }, [students])

  const questionRanks = React.useMemo(() => {
    return aggregateToRankRows({ wrong, keyOf: (q) => q.title, studentNameById })
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 8)
  }, [studentNameById, wrong])

  const knowledgeRanks = React.useMemo(() => {
    return aggregateToRankRows({ wrong, keyOf: (q) => q.knowledgePoint, studentNameById })
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 8)
  }, [studentNameById, wrong])

  const selectedStudent = React.useMemo(() => {
    if (!students.length) return null
    return students.find((s) => s.id === studentId) ?? students[0] ?? null
  }, [studentId, students])

  const wrongByStudent = React.useMemo(() => {
    if (!selectedStudent) return []
    return getWrongQuestionsByStudent(selectedStudent.id)
  }, [selectedStudent])

  const weakPoints = React.useMemo(() => {
    return Object.entries(
      wrongByStudent.reduce<Record<string, number>>((acc, q) => {
        acc[q.knowledgePoint] = (acc[q.knowledgePoint] ?? 0) + 1
        return acc
      }, {}),
    )
      .map(([knowledgePoint, count]) => ({ knowledgePoint, count }))
      .sort((a, b) => b.count - a.count)
  }, [wrongByStudent])

  if (!classes.length) {
    return (
      <WechatCard className="p-6 text-center">
        <div className="text-sm text-black/50">暂无班级数据</div>
      </WechatCard>
    )
  }

  const tabBtn = (active: boolean) =>
    `rounded-xl px-3 py-3 text-center text-sm font-semibold ${active ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">数据看板</div>
            <div className="mt-1 text-xs text-black/50">
              题目/知识点排行（原型）· 当前错题：{wrong.length} 条 · 时间范围：{rangeLabel}
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>

        <div className="mt-3">
          <Link
            href={`/mini/teacher/classes/${encodeURIComponent(classId)}`}
            className="text-sm text-[#07c160]"
          >
            ← 返回班级
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-black/60">班级</div>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-black/60">时间范围</div>
            <select
              value={range}
              onChange={(e) => {
                const next = normalizeRangePreset(e.target.value)
                setRange(next)
                if (next !== 'custom') {
                  setStart('')
                  setEnd('')
                }
              }}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="all">全部</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>

        {range === 'custom' ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-black/60">开始日期</div>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-black/60">结束日期</div>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
              />
            </div>
          </div>
        ) : null}
      </WechatCard>

      <WechatCard className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setTab('dashboard')} className={tabBtn(tab === 'dashboard')}>
            看板数据
          </button>
          <button type="button" onClick={() => setTab('student')} className={tabBtn(tab === 'student')}>
            学生数据
          </button>
        </div>
      </WechatCard>

      {tab === 'dashboard' ? (
        <>
          <WechatCard className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDashboardTab('question')}
                className={tabBtn(dashboardTab === 'question')}
              >
                题目 Top
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('knowledge')}
                className={tabBtn(dashboardTab === 'knowledge')}
              >
                知识点 Top
              </button>
            </div>
            <div className="mt-3 text-xs text-black/50">按错误率排序（示例）。</div>
          </WechatCard>

          <WechatCard>
            {(dashboardTab === 'question' ? questionRanks : knowledgeRanks).map((r, idx, arr) => (
              <React.Fragment key={r.key}>
                <WechatCell
                  title={r.title}
                  description={`错题：${r.wrongCount} · 错误率：${percentLabel(r.errorRate)} · 涉及学生：${r.students.length}人`}
                  right={<WechatTag tone={r.errorRate >= 0.4 ? 'warning' : 'default'}>{percentLabel(r.errorRate)}</WechatTag>}
                />
                {idx === arr.length - 1 ? null : <WechatDivider />}
              </React.Fragment>
            ))}
            {!(dashboardTab === 'question' ? questionRanks : knowledgeRanks).length ? (
              <div className="px-4 py-10 text-center text-sm text-black/50">
                {dashboardTab === 'question' ? '暂无题目排行数据' : '暂无知识点排行数据'}
              </div>
            ) : null}
          </WechatCard>

          <WechatCard className="p-4">
            <div className="text-xs text-black/50">
              提示：从批次页点击学生可进入档案；在档案页可一键生成个人资料（题单与册子）。
              <span className="ml-2">
                <Link href="/mini/teacher/reinforce?tab=materials" className="text-[#07c160]">
                  去生成资料 →
                </Link>
              </span>
            </div>
          </WechatCard>
        </>
      ) : null}

      {tab === 'student' ? (
        <>
          <WechatCard className="p-4">
            <div className="text-sm font-medium text-black">学生数据（原型）</div>
            <div className="mt-1 text-xs text-black/50">选择学生后，可查看时间轴、错题与薄弱点。</div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-black/60">学生</div>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-black/60">快捷入口</div>
                <Link
                  href={
                    selectedStudent
                      ? `/mini/teacher/students/${encodeURIComponent(selectedStudent.id)}?classId=${encodeURIComponent(classId)}`
                      : '#'
                  }
                  className="block w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-sm text-[#07c160] active:bg-black/5"
                >
                  查看学生档案 →
                </Link>
              </div>
            </div>
          </WechatCard>

          <WechatCard className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStudentTab('timeline')}
                className={tabBtn(studentTab === 'timeline')}
              >
                时间轴
              </button>
              <button type="button" onClick={() => setStudentTab('wrong')} className={tabBtn(studentTab === 'wrong')}>
                错题（{wrongByStudent.length}）
              </button>
              <button type="button" onClick={() => setStudentTab('weak')} className={tabBtn(studentTab === 'weak')}>
                薄弱点
              </button>
            </div>
          </WechatCard>

          {students.length > 0 && selectedStudent ? null : (
            <WechatCard className="p-6 text-center">
              <div className="text-sm text-black/50">暂无学生数据</div>
            </WechatCard>
          )}

          {studentTab === 'timeline' && selectedStudent ? (
            <WechatCard className="p-4 space-y-3">
              <div className="text-sm font-medium text-black">时间轴（原型）</div>
              <div className="text-xs text-black/50">
                按批次/日期聚合展示批改与错题沉淀（原型用错题时间替代完整批次记录）。
              </div>
              <div className="space-y-2">
                {wrongByStudent.map((q) => (
                  <div key={q.id} className="rounded-xl border border-black/10 bg-white p-3">
                    <div className="text-sm font-medium text-black">{q.title}</div>
                    <div className="mt-1 text-xs text-black/50">
                      {q.createdAt} · 知识点：{q.knowledgePoint} · 批次：{q.batchId}
                    </div>
                  </div>
                ))}
                {!wrongByStudent.length ? (
                  <div className="py-10 text-center text-sm text-black/50">
                    暂无错题记录
                  </div>
                ) : null}
              </div>
            </WechatCard>
          ) : null}

          {studentTab === 'wrong' && selectedStudent ? (
            <WechatCard className="p-4 space-y-3">
              <div className="text-sm font-medium text-black">错题列表</div>
              <div className="text-xs text-black/50">包含题目、时间、批次、知识点标签等字段（原型）。</div>
              <div className="space-y-2">
                {wrongByStudent.map((q, idx) => (
                  <div key={q.id}>
                    <WechatCell
                      title={q.title}
                      description={`知识点：${q.knowledgePoint} · 批次：${q.batchId} · ${q.createdAt}`}
                      right={<WechatTag tone="default">已完成</WechatTag>}
                    />
                    {idx === wrongByStudent.length - 1 ? null : <WechatDivider />}
                  </div>
                ))}
                {!wrongByStudent.length ? (
                  <div className="py-10 text-center text-sm text-black/50">
                    暂无错题
                  </div>
                ) : null}
              </div>
            </WechatCard>
          ) : null}

          {studentTab === 'weak' && selectedStudent ? (
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
        </>
      ) : null}
    </div>
  )
}
