'use client'

import * as React from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

import type { BatchStudentItem } from '@/lib/mock/types'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

type DraftGenerationRecord = Record<string, { readyAt: number }>

function getDraftGenerationKey(batchId: string) {
  return `shicehui:draft-generation:${batchId}`
}

function getGradingConfirmedKey(batchId: string) {
  return `shicehui:grading-confirmed:${batchId}`
}

function safeReadDraftGeneration(batchId: string): DraftGenerationRecord {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(getDraftGenerationKey(batchId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as DraftGenerationRecord
  } catch {
    return {}
  }
}

function safeWriteDraftGeneration(batchId: string, record: DraftGenerationRecord) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(getDraftGenerationKey(batchId), JSON.stringify(record))
  } catch {
    // 忽略：原型演示不要求强一致
  }
}

function safeReadGradingConfirmed(batchId: string) {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const raw = window.sessionStorage.getItem(getGradingConfirmedKey(batchId))
    if (!raw) return new Set<string>()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((x) => typeof x === 'string'))
  } catch {
    return new Set<string>()
  }
}

function safeWriteGradingConfirmed(batchId: string, ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(getGradingConfirmedKey(batchId), JSON.stringify(Array.from(ids)))
  } catch {
    // 忽略：原型演示不要求强一致
  }
}

type DraftUIStatus = '处理中' | '生成中' | '可确认'

type DraftQuestion = {
  id: string
  title: string
  score: number
  correct: boolean
}

type DraftEdits = {
  questions: DraftQuestion[]
  comment: string
}

function buildDraftQuestions(): DraftQuestion[] {
  return [
    { id: 'q1', title: '第1题：计算（初稿）', score: 5, correct: false },
    { id: 'q2', title: '第2题：填空（初稿）', score: 5, correct: true },
    { id: 'q3', title: '第3题：应用题（初稿）', score: 10, correct: false },
  ]
}

function statusTone(status: DraftUIStatus | '已确认') {
  if (status === '已确认') return 'success'
  if (status === '可确认') return 'success'
  if (status === '生成中') return 'warning'
  return 'default'
}

export function MiniGradingConfirmPanel({
  classId,
  batchId,
  items,
}: {
  classId: string
  batchId: string
  items: BatchStudentItem[]
}) {
  const searchParams = useSearchParams()
  const requestedStudentId = searchParams.get('studentId') ?? ''

  const [draftStatusByStudentId, setDraftStatusByStudentId] = React.useState<Record<string, DraftUIStatus>>({})
  const [confirmedStudentIds, setConfirmedStudentIds] = React.useState<Set<string>>(() => new Set())
  const generationTimersRef = React.useRef<Record<string, number>>({})

  const [activeStudentId, setActiveStudentId] = React.useState(() => {
    const requested = requestedStudentId && items.some((i) => i.studentId === requestedStudentId) ? requestedStudentId : ''
    return requested || items.find((i) => i.draftStatus === '可确认')?.studentId || items[0]?.studentId || ''
  })

  const draftEditsRef = React.useRef<Record<string, DraftEdits>>({})
  const prevActiveStudentIdRef = React.useRef<string | null>(null)

  const [questions, setQuestions] = React.useState<DraftQuestion[]>(buildDraftQuestions())
  const [comment, setComment] = React.useState('')

  const active = items.find((i) => i.studentId === activeStudentId) ?? null

  const getStudentDraftStatus = React.useCallback(
    (i: BatchStudentItem): DraftUIStatus => {
      const base: DraftUIStatus = i.draftStatus === '处理中' ? '处理中' : '可确认'
      return draftStatusByStudentId[i.studentId] ?? base
    },
    [draftStatusByStudentId],
  )

  React.useEffect(() => {
    setConfirmedStudentIds(safeReadGradingConfirmed(batchId))
  }, [batchId])

  React.useEffect(() => {
    // 恢复“生成中”状态
    const now = Date.now()
    const record = safeReadDraftGeneration(batchId)
    const next: Record<string, DraftUIStatus> = {}
    for (const [studentId, v] of Object.entries(record)) {
      if (!v || typeof v.readyAt !== 'number') continue
      next[studentId] = v.readyAt > now ? '生成中' : '可确认'
      if (v.readyAt > now) {
        const delay = Math.max(0, v.readyAt - now)
        const existing = generationTimersRef.current[studentId]
        if (existing) window.clearTimeout(existing)
        generationTimersRef.current[studentId] = window.setTimeout(() => {
          setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
          const latest = safeReadDraftGeneration(batchId)
          const latestV = latest[studentId]
          if (latestV && typeof latestV.readyAt === 'number' && latestV.readyAt <= Date.now()) {
            delete latest[studentId]
            safeWriteDraftGeneration(batchId, latest)
          }
        }, delay)
      }
    }
    if (Object.keys(next).length > 0) setDraftStatusByStudentId(next)

    return () => {
      for (const timerId of Object.values(generationTimersRef.current)) {
        window.clearTimeout(timerId)
      }
      generationTimersRef.current = {}
    }
  }, [batchId])

  React.useEffect(() => {
    // 在切换学生前保存当前编辑
    const prevId = prevActiveStudentIdRef.current
    if (prevId) {
      draftEditsRef.current[prevId] = { questions, comment }
    }

    if (activeStudentId) {
      const saved = draftEditsRef.current[activeStudentId]
      if (saved) {
        setQuestions(saved.questions)
        setComment(saved.comment)
      } else {
        setQuestions(buildDraftQuestions())
        setComment('')
      }
    }

    prevActiveStudentIdRef.current = activeStudentId || null
  }, [activeStudentId])

  function triggerDraftRegenerate(studentId: string) {
    const now = Date.now()
    const delay = 1200 + Math.floor(Math.random() * 800)
    const readyAt = now + delay

    setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '生成中' }))

    const record = safeReadDraftGeneration(batchId)
    record[studentId] = { readyAt }
    safeWriteDraftGeneration(batchId, record)

    const existing = generationTimersRef.current[studentId]
    if (existing) window.clearTimeout(existing)
    generationTimersRef.current[studentId] = window.setTimeout(() => {
      setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
      const latest = safeReadDraftGeneration(batchId)
      const latestV = latest[studentId]
      if (latestV && typeof latestV.readyAt === 'number' && latestV.readyAt <= Date.now()) {
        delete latest[studentId]
        safeWriteDraftGeneration(batchId, latest)
      }
    }, delay)
  }

  const activeDraftStatus: DraftUIStatus = active ? getStudentDraftStatus(active) : '处理中'
  const activeIsConfirmed = Boolean(active && confirmedStudentIds.has(active.studentId))
  const activeFinalStatus: DraftUIStatus | '已确认' = activeIsConfirmed ? '已确认' : activeDraftStatus

  const evidencePages = React.useMemo(() => {
    const base = ['/evidence/page-1.svg', '/evidence/page-2.svg', '/evidence/page-3.svg']
    const count = Math.max(1, active?.imageCount ?? 1)
    return Array.from({ length: count }, (_, idx) => ({
      id: `p${idx + 1}`,
      label: `第${idx + 1}页`,
      src: base[idx % base.length] ?? '/evidence/page-1.svg',
    }))
  }, [active?.imageCount])

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">批改确认</div>
            <div className="mt-1 text-xs text-black/50">
              低成本纠错与确认，形成最终记录（原型）。状态会写入 sessionStorage，用于批次页回显。
            </div>
          </div>
          <WechatTag tone={statusTone(activeFinalStatus)}>{activeFinalStatus}</WechatTag>
        </div>

        <div className="mt-3 text-xs text-black/50">
          <Link href={`/mini/teacher/classes/${classId}/batches/${batchId}`} className="text-[#07c160]">
            ← 返回批次详情
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        {items.map((i, idx) => {
          const isActive = i.studentId === activeStudentId
          const isConfirmed = confirmedStudentIds.has(i.studentId)
          const draftStatus = getStudentDraftStatus(i)
          const displayStatus: DraftUIStatus | '已确认' = isConfirmed ? '已确认' : draftStatus
          return (
            <React.Fragment key={i.studentId}>
              <WechatCell
                title={`${i.studentName}${isActive ? '（当前）' : ''}`}
                description={`作业张数：${i.imageCount}`}
                right={<WechatTag tone={statusTone(displayStatus)}>{displayStatus}</WechatTag>}
                onClick={() => setActiveStudentId(i.studentId)}
              />
              {idx === items.length - 1 ? null : <WechatDivider />}
            </React.Fragment>
          )
        })}
      </WechatCard>

      {!active ? (
        <WechatCard className="p-6 text-center">
          <div className="text-sm text-black/50">暂无可批改的学生</div>
        </WechatCard>
      ) : (
        <div className="space-y-4">
          <WechatCard className="p-4 space-y-3">
            <div className="text-sm font-medium text-black">初稿（示例）</div>
            <div className="space-y-2">
              {questions.map((q) => (
                <div key={q.id} className="rounded-xl border border-black/10 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-black">{q.title}</div>
                      <div className="mt-1 text-xs text-black/50">分值：{q.score}</div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-black/60">
                      <input
                        type="checkbox"
                        checked={q.correct}
                        disabled={activeIsConfirmed}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setQuestions((prev) =>
                            prev.map((it) => (it.id === q.id ? { ...it, correct: checked } : it)),
                          )
                        }}
                      />
                      正确
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-black">评语/订正点（可选）</div>
              <textarea
                value={comment}
                disabled={activeIsConfirmed}
                onChange={(e) => setComment(e.target.value)}
                placeholder="例如：第3题注意列式，移项要变号。"
                className="min-h-20 w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
                onClick={() => {
                  if (!activeStudentId) return
                  setConfirmedStudentIds((prev) => {
                    const next = new Set(prev)
                    next.delete(activeStudentId)
                    safeWriteGradingConfirmed(batchId, next)
                    return next
                  })
                  triggerDraftRegenerate(activeStudentId)
                  setQuestions(buildDraftQuestions())
                  setComment('')
                  toast.success('已触发重新识别，正在生成初稿（原型）')
                }}
              >
                重新识别
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90 disabled:opacity-50"
                disabled={activeIsConfirmed || activeDraftStatus !== '可确认'}
                onClick={() => {
                  if (!activeStudentId) return
                  draftEditsRef.current[activeStudentId] = { questions, comment }
                  setConfirmedStudentIds((prev) => {
                    const next = new Set(prev)
                    next.add(activeStudentId)
                    safeWriteGradingConfirmed(batchId, next)
                    return next
                  })
                  toast.success('已确认保存（原型）')
                }}
              >
                {activeIsConfirmed ? '已确认' : activeDraftStatus !== '可确认' ? '等待生成' : '确认保存'}
              </button>
            </div>

            {activeIsConfirmed ? (
              <button
                type="button"
                className="w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
                onClick={() => {
                  if (!activeStudentId) return
                  setConfirmedStudentIds((prev) => {
                    const next = new Set(prev)
                    next.delete(activeStudentId)
                    safeWriteGradingConfirmed(batchId, next)
                    return next
                  })
                  toast.message('已撤销确认，可继续修改（原型）')
                }}
              >
                撤销确认
              </button>
            ) : null}
          </WechatCard>

          <WechatCard className="p-4 space-y-2">
            <div className="text-sm font-medium text-black">证据（示例图片）</div>
            <div className="grid grid-cols-3 gap-2">
              {evidencePages.map((p) => (
                <a
                  key={p.id}
                  href={p.src}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-black/10 bg-white p-2 text-center text-xs text-black/60 active:bg-black/5"
                >
                  <img
                    src={p.src}
                    alt={p.label}
                    className="mx-auto h-16 w-full rounded-lg object-cover"
                  />
                  <div className="mt-1">{p.label}</div>
                </a>
              ))}
            </div>
            <div className="text-xs text-black/50">
              原型说明：真实系统可展示题目定位、批改证据、溯源信息等。
            </div>
          </WechatCard>
        </div>
      )}
    </div>
  )
}

