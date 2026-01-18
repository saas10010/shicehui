'use client'

import * as React from 'react'
import Link from 'next/link'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import {
  getClasses,
  getStudentsByClassId,
  getWrongQuestionsByClass,
} from '@/lib/mock/queries'
import type { WrongQuestion } from '@/lib/mock/types'

type DateRangePreset = '7d' | '30d' | 'all' | 'custom'

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
  const [range, setRange] = React.useState<DateRangePreset>('7d')
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')

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

  if (!classes.length) {
    return (
      <WechatCard className="p-6 text-center">
        <div className="text-sm text-black/50">暂无班级数据</div>
      </WechatCard>
    )
  }

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
        <div className="text-sm font-medium text-black">题目 Top</div>
        <div className="mt-1 text-xs text-black/50">按错误率排序（示例）。</div>
      </WechatCard>

      <WechatCard>
        {questionRanks.map((r, idx) => (
          <React.Fragment key={r.key}>
            <WechatCell
              title={r.title}
              description={`错题：${r.wrongCount} · 错误率：${percentLabel(r.errorRate)} · 涉及学生：${r.students.length}人`}
              right={<WechatTag tone={r.errorRate >= 0.4 ? 'warning' : 'default'}>{percentLabel(r.errorRate)}</WechatTag>}
            />
            {idx === questionRanks.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}
        {!questionRanks.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无题目排行数据
          </div>
        ) : null}
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">知识点 Top</div>
        <div className="mt-1 text-xs text-black/50">按错误率排序（示例）。</div>
      </WechatCard>

      <WechatCard>
        {knowledgeRanks.map((r, idx) => (
          <React.Fragment key={r.key}>
            <WechatCell
              title={r.title}
              description={`错题：${r.wrongCount} · 错误率：${percentLabel(r.errorRate)} · 涉及学生：${r.students.length}人`}
              right={<WechatTag tone={r.errorRate >= 0.4 ? 'warning' : 'default'}>{percentLabel(r.errorRate)}</WechatTag>}
            />
            {idx === knowledgeRanks.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}
        {!knowledgeRanks.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无知识点排行数据
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
    </div>
  )
}
