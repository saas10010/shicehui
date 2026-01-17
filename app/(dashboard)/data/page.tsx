import { DataDashboard } from '@/components/data/data-dashboard'
import type { DateRangePreset, RankRow } from '@/components/data/types'
import {
  getClasses,
  getStudentsByClassId,
  getWrongQuestionsByClass,
} from '@/lib/mock/queries'
import type { WrongQuestion } from '@/lib/mock/types'

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function safePickFirst(value: string | string[] | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value[0] ?? '' : value
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
  // 输入格式：YYYY-MM-DD
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
    return {
      filtered: wrong,
      rangeLabel: '全部',
      effectiveStart: '',
      effectiveEnd: '',
    }
  }

  const referenceNow = getReferenceNow(wrong)

  if (range === 'custom') {
    const startDate = parseDateOnly(start)
    const endDate = parseDateOnly(end)
    if (!startDate || !endDate) {
      return {
        filtered: wrong,
        rangeLabel: '自定义（未填写，展示全部）',
        effectiveStart: start,
        effectiveEnd: end,
      }
    }

    const startTs = startDate.getTime()
    const endTs = endDate.getTime() + 24 * 60 * 60 * 1000 - 1
    const filtered = wrong.filter((q) => {
      const dt = parseCreatedAt(q.createdAt)
      if (!dt) return false
      const ts = dt.getTime()
      return ts >= startTs && ts <= endTs
    })

    return {
      filtered,
      rangeLabel: `${start} 至 ${end}`,
      effectiveStart: start,
      effectiveEnd: end,
    }
  }

  const days = range === '30d' ? 30 : 7
  const cutoff = new Date(referenceNow.getTime() - days * 24 * 60 * 60 * 1000)
  const filtered = wrong.filter((q) => {
    const dt = parseCreatedAt(q.createdAt)
    return dt ? dt.getTime() >= cutoff.getTime() : false
  })

  return {
    filtered,
    rangeLabel: `最近${days}天（截止 ${formatDateOnly(referenceNow)}）`,
    effectiveStart: '',
    effectiveEnd: '',
  }
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
    const prev = map.get(key) ?? {
      sum: 0,
      count: 0,
      studentIds: new Set<string>(),
      samples: [],
    }
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

export default async function DataPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}

  const classes = getClasses()
  if (!classes.length) {
    return (
      <div className="rounded-2xl border-4 border-black bg-white/70 p-6 text-center text-sm font-bold">
        暂无班级数据
      </div>
    )
  }

  const classIdFromQuery = safePickFirst(sp.classId)
  const selectedClassId = classes.some((c) => c.id === classIdFromQuery)
    ? classIdFromQuery
    : classes[0]!.id

  const range = normalizeRangePreset(safePickFirst(sp.range) || '7d')
  const start = safePickFirst(sp.start)
  const end = safePickFirst(sp.end)

  const wrongAll = getWrongQuestionsByClass(selectedClassId)
  const { filtered: wrong, rangeLabel, effectiveStart, effectiveEnd } = filterWrongByRange({
    wrong: wrongAll,
    range,
    start,
    end,
  })

  const students = getStudentsByClassId(selectedClassId)
  const studentNameById = students.reduce<Record<string, string>>((acc, s) => {
    acc[s.id] = s.name
    return acc
  }, {})

  const questionRanks = aggregateToRankRows({
    wrong,
    keyOf: (q) => q.title,
    studentNameById,
  })
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 8)

  const knowledgeRanks = aggregateToRankRows({
    wrong,
    keyOf: (q) => q.knowledgePoint,
    studentNameById,
  })
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 8)

  return (
    <DataDashboard
      classes={classes}
      selectedClassId={selectedClassId}
      range={range}
      start={effectiveStart}
      end={effectiveEnd}
      rangeLabel={rangeLabel}
      totalWrongCount={wrong.length}
      questionRanks={questionRanks}
      knowledgeRanks={knowledgeRanks}
    />
  )
}
