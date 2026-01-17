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

type DraftQuestion = {
  id: string
  title: string
  score: number
  correct: boolean
}

const draftStatusNeedsAttentionHelp =
  '该学生存在异常需先处理（缺码/识别冲突/码损坏等），处理后再确认。'

const gradingPendingHelp =
  '用于把当前学生暂缓处理（例如初稿明显错误/无法确认），后续再处理或重新识别（演示：不持久化）。'

function buildDraftQuestions(): DraftQuestion[] {
  return [
    { id: 'q1', title: '第1题：计算（初稿）', score: 5, correct: false },
    { id: 'q2', title: '第2题：填空（初稿）', score: 5, correct: true },
    { id: 'q3', title: '第3题：应用题（初稿）', score: 10, correct: false },
  ]
}

export function GradingConfirmPanel({
  items,
}: {
  items: BatchStudentItem[]
}) {
  const [pendingStudentIds, setPendingStudentIds] = React.useState<Set<string>>(
    () => new Set(),
  )

  const [activeStudentId, setActiveStudentId] = React.useState(
    items.find((i) => i.draftStatus === '可确认')?.studentId ?? items[0]?.studentId,
  )

  const active = items.find((i) => i.studentId === activeStudentId) ?? null
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

        <div className="mt-3 space-y-2">
            {items.map((i) => {
              const activeRow = i.studentId === activeStudentId
              const isPending = pendingStudentIds.has(i.studentId)
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
                    <div className="truncate">{i.studentName}</div>
                    {isPending ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="shrink-0">
                            <StatusBadge status="待处理" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-80">
                          {gradingPendingHelp}
                        </TooltipContent>
                      </Tooltip>
                    ) : i.draftStatus === '需处理' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="shrink-0">
                          <StatusBadge status={i.draftStatus} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-80">
                        {draftStatusNeedsAttentionHelp}
                      </TooltipContent>
                  </Tooltip>
                  ) : (
                    <StatusBadge status={i.draftStatus} className="shrink-0" />
                  )}
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
          onClick={() => toast.success('已批量确认（原型占位）')}
        >
          批量确认（占位）
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
          {active &&
            (pendingStudentIds.has(active.studentId) ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    <StatusBadge status="待处理" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-80">
                  {gradingPendingHelp}
                </TooltipContent>
              </Tooltip>
            ) : active.draftStatus === '需处理' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    <StatusBadge status={active.draftStatus} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-80">
                  {draftStatusNeedsAttentionHelp}
                </TooltipContent>
              </Tooltip>
            ) : (
              <StatusBadge status={active.draftStatus} />
            ))}
        </div>

        {!active || active.draftStatus === '处理中' ? (
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
                        setPendingStudentIds((prev) => {
                          const next = new Set(prev)
                          next.add(activeStudentId)
                          return next
                        })
                        toast.message('已标记为待处理（原型未持久化）')
                      }}
                    >
                      标记待处理
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-80">
                    {gradingPendingHelp}
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
