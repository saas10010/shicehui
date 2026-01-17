import { DataDashboard } from '@/components/data/data-dashboard'
import { getWrongQuestionsByClass } from '@/lib/mock/queries'

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function aggregateBy<T extends string>(
  items: { key: T; errorRate: number }[],
) {
  const map = new Map<string, { sum: number; count: number }>()
  for (const item of items) {
    const prev = map.get(item.key) ?? { sum: 0, count: 0 }
    map.set(item.key, { sum: prev.sum + item.errorRate, count: prev.count + 1 })
  }
  return [...map.entries()].map(([key, v]) => ({
    key,
    title: key,
    wrongCount: v.count,
    errorRate: clamp01(v.sum / Math.max(1, v.count)),
  }))
}

export default function DataPage() {
  // 原型：默认展示一个班级的数据
  const wrong = getWrongQuestionsByClass('c-7-1')

  const questionRanks = aggregateBy(
    wrong.map((q) => ({ key: q.title, errorRate: q.errorRate })),
  )
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 8)

  const knowledgeRanks = aggregateBy(
    wrong.map((q) => ({ key: q.knowledgePoint, errorRate: q.errorRate })),
  )
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 8)

  return <DataDashboard questionRanks={questionRanks} knowledgeRanks={knowledgeRanks} />
}

