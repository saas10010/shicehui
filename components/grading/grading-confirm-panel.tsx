'use client'

import * as React from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

import type { BatchStudentItem } from '@/lib/mock/types'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

type DraftGenerationRecord = Record<string, { readyAt: number }>

function getDraftGenerationKey(batchId: string) {
  return `shicehui:draft-generation:${batchId}`
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
    window.sessionStorage.setItem(
      getDraftGenerationKey(batchId),
      JSON.stringify(record),
    )
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

function buildDraftQuestions(): DraftQuestion[] {
  return [
    { id: 'q1', title: '第1题：计算（初稿）', score: 5, correct: false },
    { id: 'q2', title: '第2题：填空（初稿）', score: 5, correct: true },
    { id: 'q3', title: '第3题：应用题（初稿）', score: 10, correct: false },
  ]
}

export function GradingConfirmPanel({
  batchId,
  items,
  defaultStudentId,
}: {
  batchId: string
  items: BatchStudentItem[]
  defaultStudentId?: string
}) {
  const [draftStatusByStudentId, setDraftStatusByStudentId] = React.useState<
    Record<string, DraftUIStatus>
  >({})
  const generationTimersRef = React.useRef<Record<string, number>>({})
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [confirmedStudentIds, setConfirmedStudentIds] = React.useState<Set<string>>(
    () => new Set(),
  )

  const getStudentDraftStatus = React.useCallback(
    (i: BatchStudentItem): DraftUIStatus => {
      const base: DraftUIStatus = i.draftStatus === '处理中' ? '处理中' : '可确认'
      return draftStatusByStudentId[i.studentId] ?? base
    },
    [draftStatusByStudentId],
  )

  const isStudentSelectable = React.useCallback(
    (i: BatchStudentItem) => {
      // 原型口径：仅“可确认”的学生允许被批量确认选择（生成中/处理中不允许）
      return getStudentDraftStatus(i) === '可确认' && !confirmedStudentIds.has(i.studentId)
    },
    [confirmedStudentIds, getStudentDraftStatus],
  )

  function triggerDraftRegenerate(studentId: string) {
    const now = Date.now()
    const delay = 1500 + Math.floor(Math.random() * 1200)
    const readyAt = now + delay

    setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '生成中' }))

    const record = safeReadDraftGeneration(batchId)
    record[studentId] = { readyAt }
    safeWriteDraftGeneration(batchId, record)

    const existingTimer = generationTimersRef.current[studentId]
    if (existingTimer) window.clearTimeout(existingTimer)

    generationTimersRef.current[studentId] = window.setTimeout(() => {
      setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
      const latest = safeReadDraftGeneration(batchId)
      const latestV = latest[studentId]
      if (
        latestV &&
        typeof latestV.readyAt === 'number' &&
        latestV.readyAt <= Date.now()
      ) {
        delete latest[studentId]
        safeWriteDraftGeneration(batchId, latest)
      }
    }, delay)
  }

  React.useEffect(() => {
    const now = Date.now()
    const record = safeReadDraftGeneration(batchId)
    const next: Record<string, DraftUIStatus> = {}

    for (const [studentId, v] of Object.entries(record)) {
      if (!v || typeof v.readyAt !== 'number') continue
      next[studentId] = v.readyAt > now ? '生成中' : '可确认'
      if (v.readyAt > now) {
        const delay = Math.max(0, v.readyAt - now)
        const existingTimer = generationTimersRef.current[studentId]
        if (existingTimer) window.clearTimeout(existingTimer)
        generationTimersRef.current[studentId] = window.setTimeout(() => {
          setDraftStatusByStudentId((prev) => ({
            ...prev,
            [studentId]: '可确认',
          }))
          const latest = safeReadDraftGeneration(batchId)
          const latestV = latest[studentId]
          if (
            latestV &&
            typeof latestV.readyAt === 'number' &&
            latestV.readyAt <= Date.now()
          ) {
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

  const [activeStudentId, setActiveStudentId] = React.useState(() => {
    const requested =
      defaultStudentId && items.some((i) => i.studentId === defaultStudentId)
        ? defaultStudentId
        : null
    return (
      requested ??
      items.find((i) => i.draftStatus === '可确认')?.studentId ??
      items[0]?.studentId
    )
  })

  const active = items.find((i) => i.studentId === activeStudentId) ?? null
  const activeDraftStatus: DraftUIStatus = React.useMemo(() => {
    if (!active) return '处理中'
    const base: DraftUIStatus = active.draftStatus === '处理中' ? '处理中' : '可确认'
    return draftStatusByStudentId[active.studentId] ?? base
  }, [active, draftStatusByStudentId])
  const activeFinalStatus = React.useMemo(() => {
    if (!active) return null
    return confirmedStudentIds.has(active.studentId) ? '已完成' : activeDraftStatus
  }, [active, activeDraftStatus, confirmedStudentIds])
  const [questions, setQuestions] = React.useState<DraftQuestion[]>(
    buildDraftQuestions(),
  )
  const [comment, setComment] = React.useState('')

  React.useEffect(() => {
    setQuestions(buildDraftQuestions())
    setComment('')
  }, [activeStudentId])

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-black">学生列表</div>
          <div className="text-xs text-muted-foreground">↑↓（待实现）</div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            已选择：{selectedStudentIds.size}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-xl border-2 border-black px-3 text-xs font-bold"
              onClick={() => {
                const selectableIds = items
                  .filter(isStudentSelectable)
                  .map((i) => i.studentId)
                if (selectableIds.length === 0) {
                  toast.message('暂无可确认的学生可全选（原型）')
                  return
                }
                setSelectedStudentIds(new Set(selectableIds))
                toast.success(`已全选可确认：${selectableIds.length} 人（原型）`)
              }}
            >
              全选可确认
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-xl border-2 border-black px-3 text-xs font-bold"
              onClick={() => {
                setSelectedStudentIds(new Set())
                toast.message('已清空选择（原型）')
              }}
              disabled={selectedStudentIds.size === 0}
            >
              清空
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
            {items.map((i) => {
              const activeRow = i.studentId === activeStudentId
	              const baseDraftStatus: DraftUIStatus =
	                i.draftStatus === '处理中' ? '处理中' : '可确认'
	              const draftStatus: DraftUIStatus =
	                draftStatusByStudentId[i.studentId] ?? baseDraftStatus
                const finalStatus = confirmedStudentIds.has(i.studentId)
                  ? '已完成'
                  : draftStatus
                const selectable = isStudentSelectable(i)
                const checked = selectedStudentIds.has(i.studentId)
              return (
                <button
                  key={i.studentId}
                  type="button"
                className={cn(
                  'w-full rounded-xl border-2 border-black p-3 text-left font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                  activeRow ? 'bg-black text-white' : 'bg-white hover:bg-white/70',
                )}
                onClick={() => setActiveStudentId(i.studentId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="inline-flex"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-black"
                          checked={checked}
                          disabled={!selectable}
                          onChange={() => {
                            setSelectedStudentIds((prev) => {
                              const next = new Set(prev)
                              if (next.has(i.studentId)) next.delete(i.studentId)
                              else next.add(i.studentId)
                              return next
                            })
                          }}
                        />
                      </span>
                      <div className="truncate">{i.studentName}</div>
                    </div>
	                    <StatusBadge status={finalStatus} className="shrink-0" />
                  </div>
                  <div className={cn('mt-1 text-xs', activeRow ? 'text-white/80' : 'text-muted-foreground')}>
                  作业张数：{i.imageCount} · 异常：{i.exceptions}
                </div>
              </button>
            )
          })}
        </div>

        <Button
          className="mt-4 w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          disabled={selectedStudentIds.size === 0}
          onClick={() => {
            const selectedIds = Array.from(selectedStudentIds)
            if (selectedIds.length === 0) return
            setConfirmedStudentIds((prev) => {
              const next = new Set(prev)
              for (const id of selectedIds) next.add(id)
              return next
            })
            setSelectedStudentIds(new Set())
            toast.success(`已批量确认：${selectedIds.length} 人（原型未持久化）`)
          }}
        >
          批量确认
        </Button>
      </div>

      <div className="rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-black">批改确认</div>
            <div className="text-sm text-muted-foreground">
              快速纠错：改对错/改分数/补评语（FR7）。
            </div>
	          </div>
          {active && <StatusBadge status={activeFinalStatus ?? activeDraftStatus} />}
        </div>

        {!active || activeDraftStatus !== '可确认' ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="space-y-3">
              <div className="text-sm font-bold">作业图片（占位）</div>
              <div className="relative h-56 w-full overflow-hidden rounded-xl border-2 border-black bg-white">
                <Image
                  src="/placeholder.jpg"
                  alt="作业图片占位"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                原型说明：真实系统应展示题目/答案区域与证据视图。
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold">题目初稿</div>
              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border-2 border-black bg-white/70 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-bold">{q.title}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={q.correct ? 'default' : 'outline'}
                          className="h-9 rounded-xl border-2 border-black font-bold"
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.map((x) =>
                                x.id === q.id ? { ...x, correct: true } : x,
                              ),
                            )
                          }
                        >
                          对
                        </Button>
                        <Button
                          type="button"
                          variant={!q.correct ? 'destructive' : 'outline'}
                          className="h-9 rounded-xl border-2 border-black font-bold"
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.map((x) =>
                                x.id === q.id ? { ...x, correct: false } : x,
                              ),
                            )
                          }
                        >
                          错
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">分数</div>
                      <Input
                        className="h-9 w-24 border-2 border-black rounded-xl"
                        value={q.score}
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = Number(e.target.value || 0)
                          setQuestions((prev) =>
                            prev.map((x) =>
                              x.id === q.id ? { ...x, score: value } : x,
                            ),
                          )
                        }}
                      />
                      <div className="text-xs text-muted-foreground">
                        （原型：不做校验）
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold">评语/订正点（可选）</div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border-2 border-black rounded-xl"
                  placeholder="例如：第3题注意列式，移项要变号。"
                />
              </div>

	              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-xl border-2 border-black font-bold"
                        onClick={() => {
                          if (!activeStudentId) return
                          triggerDraftRegenerate(activeStudentId)
                          setQuestions(buildDraftQuestions())
                          setComment('')
                          toast.success('已触发重新识别，正在生成初稿（原型）')
                        }}
                      >
                        重新识别
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-80">
                      原型说明：触发一次“重新识别/重算初稿”演示，状态会短暂变为「生成中」。
                    </TooltipContent>
                  </Tooltip>
	                <Button
	                  className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
	                  onClick={() => toast.success('已保存并确认（原型未持久化）')}
	                >
                  确认保存（Enter 待实现）
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}
