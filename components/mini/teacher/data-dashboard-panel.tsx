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

type TimelineGroup = {
  dateKey: string
  items: WrongQuestion[]
  count: number
  batchCount: number
  topKnowledgePoints: { knowledgePoint: string; count: number }[]
}

export function MiniDataDashboardPanel({
  defaultClassId,
  lockClassId,
  defaultTab,
  defaultStudentId,
}: {
  defaultClassId?: string
  lockClassId?: boolean
  defaultTab?: MainTab
  defaultStudentId?: string
}) {
  const classes = React.useMemo(() => getClasses(), [])
  const isDefaultClassIdValid = Boolean(
    defaultClassId && classes.some((c) => c.id === defaultClassId),
  )
  const shouldLockClassId = Boolean(lockClassId && isDefaultClassIdValid)
  const [classId, setClassId] = React.useState(() => {
    if (defaultClassId && classes.some((c) => c.id === defaultClassId)) return defaultClassId
    return classes[0]?.id ?? ''
  })
  const [tab, setTab] = React.useState<MainTab>(() => (defaultTab === 'student' ? 'student' : 'dashboard'))
  const [dashboardTab, setDashboardTab] = React.useState<DashboardTab>('question')
  const [range, setRange] = React.useState<DateRangePreset>('7d')
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')
  const initialStudentIdRef = React.useRef(defaultStudentId)
  const [studentId, setStudentId] = React.useState(() => defaultStudentId ?? '')
  const [studentTab, setStudentTab] = React.useState<StudentTab>('timeline')
  const [timelineExpanded, setTimelineExpanded] = React.useState<Record<string, boolean>>({})

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
      const initial = initialStudentIdRef.current
      if (initial && students.some((s) => s.id === initial)) return initial
      if (prev && students.some((s) => s.id === prev)) return prev
      return students[0]?.id ?? ''
    })
    initialStudentIdRef.current = ''
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

  React.useEffect(() => {
    // 切换学生后，收起时间轴分组，避免跨学生沿用展开状态造成理解偏差
    setTimelineExpanded({})
  }, [selectedStudent?.id])

  const timelineGroups = React.useMemo((): TimelineGroup[] => {
    const map = new Map<string, WrongQuestion[]>()

    for (const q of wrongByStudent) {
      const dt = parseCreatedAt(q.createdAt)
      const dateKey = dt ? formatDateOnly(dt) : '未知日期'
      const prev = map.get(dateKey) ?? []
      prev.push(q)
      map.set(dateKey, prev)
    }

    const sortByCreatedAtDesc = (a: WrongQuestion, b: WrongQuestion) => {
      const adt = parseCreatedAt(a.createdAt)
      const bdt = parseCreatedAt(b.createdAt)
      const ats = adt ? adt.getTime() : -Infinity
      const bts = bdt ? bdt.getTime() : -Infinity
      return bts - ats
    }

    const groups: TimelineGroup[] = []

    for (const [dateKey, items] of map.entries()) {
      const itemsSorted = [...items].sort(sortByCreatedAtDesc)
      const batchIds = new Set(itemsSorted.map((q) => q.batchId))

      const kpCounts = itemsSorted.reduce<Record<string, number>>((acc, q) => {
        acc[q.knowledgePoint] = (acc[q.knowledgePoint] ?? 0) + 1
        return acc
      }, {})

      const topKnowledgePoints = Object.entries(kpCounts)
        .map(([knowledgePoint, count]) => ({ knowledgePoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)

      groups.push({
        dateKey,
        items: itemsSorted,
        count: itemsSorted.length,
        batchCount: batchIds.size,
        topKnowledgePoints,
      })
    }

    const dateKeyDesc = (a: TimelineGroup, b: TimelineGroup) => {
      if (a.dateKey === '未知日期' && b.dateKey !== '未知日期') return 1
      if (b.dateKey === '未知日期' && a.dateKey !== '未知日期') return -1
      return b.dateKey.localeCompare(a.dateKey)
    }

    return groups.sort(dateKeyDesc)
  }, [wrongByStudent])

  const weakPoints = React.useMemo(() => {
    const map = new Map<
      string,
      {
        knowledgePoint: string
        count: number
        sumErrorRate: number
        lastAtLabel: string
        lastAtTs: number
        batchIds: Set<string>
        samples: string[]
      }
    >()

    for (const q of wrongByStudent) {
      const key = q.knowledgePoint || '未标注知识点'
      const prev =
        map.get(key) ??
        ({
          knowledgePoint: key,
          count: 0,
          sumErrorRate: 0,
          lastAtLabel: '—',
          lastAtTs: -Infinity,
          batchIds: new Set<string>(),
          samples: [],
        } as {
          knowledgePoint: string
          count: number
          sumErrorRate: number
          lastAtLabel: string
          lastAtTs: number
          batchIds: Set<string>
          samples: string[]
        })

      const dt = parseCreatedAt(q.createdAt)
      const ts = dt ? dt.getTime() : -Infinity
      const lastAtLabel = ts > prev.lastAtTs ? (dt ? formatDateOnly(dt) : '未知日期') : prev.lastAtLabel

      const next = {
        ...prev,
        count: prev.count + 1,
        sumErrorRate: prev.sumErrorRate + q.errorRate,
        lastAtLabel,
        lastAtTs: Math.max(prev.lastAtTs, ts),
      }

      next.batchIds.add(q.batchId)
      if (next.samples.length < 3 && !next.samples.includes(q.title)) next.samples.push(q.title)

      map.set(key, next)
    }

    return [...map.values()]
      .map((w) => ({
        knowledgePoint: w.knowledgePoint,
        count: w.count,
        avgErrorRate: clamp01(w.sumErrorRate / Math.max(1, w.count)),
        lastAtLabel: w.lastAtLabel,
        batchCount: w.batchIds.size,
        samples: w.samples,
      }))
      .sort((a, b) => b.count - a.count || b.avgErrorRate - a.avgErrorRate)
  }, [wrongByStudent])

  if (!classes.length) {
    return (
      <WechatCard className="p-6 text-center">
        <div className="text-sm text-black/50">暂无班级数据</div>
      </WechatCard>
    )
  }

  const segmentedBtn = (active: boolean, pos: 'left' | 'middle' | 'right') => {
    const base = 'px-3 py-2.5 text-center text-sm font-semibold border border-black/10'
    const state = active ? 'bg-[#07c160] text-white border-[#07c160]' : 'bg-white text-black active:bg-black/5'
    const radius =
      pos === 'left'
        ? 'rounded-l-xl'
        : pos === 'right'
          ? 'rounded-r-xl -ml-px'
          : '-ml-px'
    return `${base} ${state} ${radius}`
  }

  const currentClassName = classes.find((c) => c.id === classId)?.name ?? '—'

  return (
    <div className="space-y-0">
      <WechatCard>
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-black">数据看板</div>
              {tab === 'dashboard' ? (
                <div className="mt-1 text-xs text-black/50">
                  整体看板（原型）· 当前错题：{wrong.length} 条
                </div>
              ) : (
                <div className="mt-1 text-xs text-black/50">
                  学生看板（原型）· 当前学生：{selectedStudent?.name ?? '—'} · 错题：{wrongByStudent.length} 条
                </div>
              )}
            </div>
            <WechatTag tone="default">原型</WechatTag>
          </div>

          <div className="mt-2">
            <Link
              href={`/mini/teacher/classes/${encodeURIComponent(classId)}`}
              className="text-sm text-[#07c160]"
            >
              ← 返回班级
            </Link>
          </div>

          {shouldLockClassId ? (
            <div className="mt-2 text-xs text-black/50">当前班级：{currentClassName}</div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-2">
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
            </div>
          )}
        </div>

        <WechatDivider />

        <div className="p-2">
          <div className="grid grid-cols-2 overflow-hidden">
            <button
              type="button"
              onClick={() => setTab('dashboard')}
              className={segmentedBtn(tab === 'dashboard', 'left')}
            >
              整体看板
            </button>
            <button
              type="button"
              onClick={() => setTab('student')}
              className={segmentedBtn(tab === 'student', 'right')}
            >
              学生看板
            </button>
          </div>
        </div>

        <WechatDivider />

        {tab === 'dashboard' ? (
          <>
            <div className="p-3">
              <div className="grid grid-cols-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDashboardTab('question')}
                  className={segmentedBtn(dashboardTab === 'question', 'left')}
                >
                  题目 Top
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardTab('knowledge')}
                  className={segmentedBtn(dashboardTab === 'knowledge', 'right')}
                >
                  知识点 Top
                </button>
              </div>

              <div className="mt-2 text-xs text-black/50">
                按错误率排序（示例）· 统计口径：{rangeLabel}
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2">
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

                {range === 'custom' ? (
                  <div className="grid grid-cols-2 gap-2">
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
              </div>
            </div>

            <WechatDivider />

            {(dashboardTab === 'question' ? questionRanks : knowledgeRanks).map((r, idx, arr) => (
              <React.Fragment key={r.key}>
                <WechatCell
                  title={r.title}
                  description={`错题：${r.wrongCount} · 错误率：${percentLabel(r.errorRate)} · 涉及学生：${r.students.length}人`}
                  right={
                    <WechatTag tone={r.errorRate >= 0.4 ? 'warning' : 'default'}>
                      {percentLabel(r.errorRate)}
                    </WechatTag>
                  }
                />
                {idx === arr.length - 1 ? null : <WechatDivider />}
              </React.Fragment>
            ))}

            {!(dashboardTab === 'question' ? questionRanks : knowledgeRanks).length ? (
              <div className="px-4 py-10 text-center text-sm text-black/50">
                {dashboardTab === 'question' ? '暂无题目排行数据' : '暂无知识点排行数据'}
              </div>
            ) : null}

          </>
        ) : null}

        {tab === 'student' ? (
          <>
            <div className="p-3">
              <div className="text-sm font-medium text-black">学生看板（原型）</div>
              <div className="mt-1 text-xs text-black/50">选择学生后，可查看时间轴、错题与薄弱点。</div>

              <div className="mt-2 grid grid-cols-1 gap-2">
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
              </div>
            </div>

            <WechatDivider />

            <div className="p-2">
              <div className="grid grid-cols-3 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setStudentTab('timeline')}
                  className={segmentedBtn(studentTab === 'timeline', 'left')}
                >
                  时间轴
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('wrong')}
                  className={segmentedBtn(studentTab === 'wrong', 'middle')}
                >
                  错题（{wrongByStudent.length}）
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('weak')}
                  className={segmentedBtn(studentTab === 'weak', 'right')}
                >
                  薄弱点
                </button>
              </div>
            </div>

            <WechatDivider />

            {students.length > 0 && selectedStudent ? null : (
              <div className="p-6 text-center text-sm text-black/50">暂无学生数据</div>
            )}

            {studentTab === 'timeline' && selectedStudent ? (
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium text-black">时间轴（原型）</div>
                <div className="text-xs text-black/50">
                  按日期聚合展示错题沉淀，并给出主要知识点摘要（原型口径：仅基于错题数据）。
                </div>
                <div className="space-y-2">
                  {timelineGroups.map((g) => {
                    const expanded = Boolean(timelineExpanded[g.dateKey])
                    const visible = expanded ? g.items : g.items.slice(0, 3)
                    const kpLabel = g.topKnowledgePoints.length
                      ? g.topKnowledgePoints.map((kp) => `${kp.knowledgePoint}（${kp.count}）`).join('、')
                      : '—'

                    return (
                      <div key={g.dateKey} className="rounded-2xl border border-black/10 bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-black">{g.dateKey}</div>
                            <div className="mt-1 text-xs text-black/50">
                              错题：{g.count} 条 · 涉及批次：{g.batchCount} · 主要知识点：{kpLabel}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTimelineExpanded((prev) => ({
                                ...prev,
                                [g.dateKey]: !expanded,
                              }))
                            }
                            className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black active:bg-black/5"
                          >
                            {expanded ? '收起' : '展开'}
                          </button>
                        </div>

                        <div className="mt-2 overflow-hidden rounded-xl border border-black/5">
                          {visible.map((q, idx) => (
                            <React.Fragment key={q.id}>
                              <WechatCell
                                title={q.title}
                                description={`知识点：${q.knowledgePoint} · 批次：${q.batchId} · ${q.createdAt}`}
                                right={
                                  <WechatTag tone={q.errorRate >= 0.4 ? 'warning' : 'default'}>
                                    {percentLabel(q.errorRate)}
                                  </WechatTag>
                                }
                              />
                              {idx === visible.length - 1 ? null : <WechatDivider />}
                            </React.Fragment>
                          ))}
                        </div>

                        {!expanded && g.items.length > 3 ? (
                          <div className="mt-2 text-xs text-black/50">还有 {g.items.length - 3} 条，点击“展开”查看</div>
                        ) : null}
                      </div>
                    )
                  })}

                  {!timelineGroups.length ? (
                    <div className="py-10 text-center text-sm text-black/50">
                      暂无错题记录
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {studentTab === 'wrong' && selectedStudent ? (
              <>
                <div className="p-3">
                  <div className="text-sm font-medium text-black">错题列表</div>
                  <div className="mt-1 text-xs text-black/50">包含题目、时间、批次、知识点标签等字段（原型）。</div>
                </div>
                {wrongByStudent.map((q, idx) => (
                  <React.Fragment key={q.id}>
                    <WechatCell
                      title={q.title}
                      description={`知识点：${q.knowledgePoint} · 批次：${q.batchId} · ${q.createdAt}`}
                      right={<WechatTag tone="default">已完成</WechatTag>}
                    />
                    {idx === wrongByStudent.length - 1 ? null : <WechatDivider />}
                  </React.Fragment>
                ))}
                {!wrongByStudent.length ? (
                  <div className="px-4 py-10 text-center text-sm text-black/50">
                    暂无错题
                  </div>
                ) : null}
              </>
            ) : null}

            {studentTab === 'weak' && selectedStudent ? (
              <div className="p-3 space-y-2">
                <div className="text-sm font-medium text-black">薄弱点概览</div>
                <div className="text-xs text-black/50">
                  按知识点聚合，补充平均错误率、最近出现时间与样本题目（原型口径：基于错题，不等同于掌握度）。
                </div>
                <div className="space-y-2">
                  {weakPoints.map((w) => (
                    <div key={w.knowledgePoint} className="rounded-xl border border-black/10 bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-medium text-black">{w.knowledgePoint}</div>
                        <WechatTag tone={w.avgErrorRate >= 0.4 || w.count >= 3 ? 'warning' : 'default'}>
                          {percentLabel(w.avgErrorRate)}
                        </WechatTag>
                      </div>
                      <div className="mt-1 text-xs text-black/50">
                        错误次数：{w.count} · 涉及批次：{w.batchCount} · 最近一次：{w.lastAtLabel}
                      </div>
                      {w.samples.length ? (
                        <div className="mt-2 rounded-lg bg-black/[0.03] p-2 text-xs text-black/70">
                          样本题目：{w.samples.join('、')}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {!weakPoints.length ? (
                    <div className="py-10 text-center text-sm text-black/50">
                      暂无薄弱点数据
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </WechatCard>
    </div>
  )
}
