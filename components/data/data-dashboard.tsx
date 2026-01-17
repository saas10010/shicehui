'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BrutalCard } from '@/components/brutal/brutal-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ClassInfo } from '@/lib/mock/types'
import type { DateRangePreset, RankRow } from '@/components/data/types'

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function DataDashboard({
  classes,
  selectedClassId,
  range,
  start,
  end,
  rangeLabel,
  totalWrongCount,
  questionRanks,
  knowledgeRanks,
}: {
  classes: ClassInfo[]
  selectedClassId: string
  range: DateRangePreset
  start: string
  end: string
  rangeLabel: string
  totalWrongCount: number
  questionRanks: RankRow[]
  knowledgeRanks: RankRow[]
}) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState<RankRow | null>(null)
  const [rangeDraft, setRangeDraft] = React.useState<DateRangePreset>(range)
  const [startDraft, setStartDraft] = React.useState(start)
  const [endDraft, setEndDraft] = React.useState(end)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => setRangeDraft(range), [range])
  React.useEffect(() => setStartDraft(start), [start])
  React.useEffect(() => setEndDraft(end), [end])
  React.useEffect(() => {
    setOpen(false)
    setActive(null)
  }, [selectedClassId, rangeLabel])

  function pushQuery(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams?.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v) params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black">班级看板</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              按时间范围统计题目/知识点错误率排行（FR9/Story 2.6）。
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              当前范围：{rangeLabel} · 错题记录：{totalWrongCount} 条
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={selectedClassId}
                onValueChange={(value) => {
                  pushQuery({ classId: value })
                  toast.message('已切换班级')
                }}
              >
                <SelectTrigger className="h-10 w-44 border-2 border-black rounded-xl bg-white">
                  <SelectValue placeholder="选择班级" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rangeDraft}
                onValueChange={(value) => {
                  const next = value as DateRangePreset
                  setRangeDraft(next)
                  if (next !== 'custom') {
                    pushQuery({ range: next, start: undefined, end: undefined })
                  }
                }}
              >
                <SelectTrigger className="h-10 w-44 border-2 border-black rounded-xl bg-white">
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent className="border-2 border-black">
                  <SelectItem value="7d">最近7天</SelectItem>
                  <SelectItem value="30d">最近30天</SelectItem>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rangeDraft === 'custom' && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="date"
                  value={startDraft}
                  onChange={(e) => setStartDraft(e.target.value)}
                  className="h-10 w-44 border-2 border-black rounded-xl"
                />
                <Input
                  type="date"
                  value={endDraft}
                  onChange={(e) => setEndDraft(e.target.value)}
                  className="h-10 w-44 border-2 border-black rounded-xl"
                />
                <Button
                  className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  onClick={() => {
                    pushQuery({ range: 'custom', start: startDraft, end: endDraft })
                    toast.message('已应用自定义时间范围')
                  }}
                >
                  应用
                </Button>
              </div>
            )}
          </div>
        </div>
      </BrutalCard>

      <Tabs defaultValue="question" className="w-full">
        <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
          <TabsTrigger value="question" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            题目排行
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            知识点排行
          </TabsTrigger>
        </TabsList>

        <TabsContent value="question">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">Top 题目（按错误率）</div>
            <div className="mt-4 space-y-3">
              {questionRanks.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className="w-full rounded-xl border-2 border-black bg-white/70 p-4 text-left hover:bg-white"
                  onClick={() => {
                    setActive(row)
                    setOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{row.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        错误数：{row.wrongCount}
                      </div>
                    </div>
                    <div className="text-lg font-black">{percent(row.errorRate)}</div>
                  </div>
                </button>
              ))}
              {!questionRanks.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
                  该时间范围暂无题目排行数据
                </div>
              )}
            </div>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="knowledge">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">Top 知识点（按错误率）</div>
            <div className="mt-4 space-y-3">
              {knowledgeRanks.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className="w-full rounded-xl border-2 border-black bg-white/70 p-4 text-left hover:bg-white"
                  onClick={() => {
                    setActive(row)
                    setOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{row.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        错误数：{row.wrongCount}
                      </div>
                    </div>
                    <div className="text-lg font-black">{percent(row.errorRate)}</div>
                  </div>
                </button>
              ))}
              {!knowledgeRanks.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
                  该时间范围暂无知识点排行数据
                </div>
              )}
            </div>
          </BrutalCard>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-black">
              {active?.title ?? '详情'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>错误率：{active ? percent(active.errorRate) : '—'}</div>
            <div>错误数：{active?.wrongCount ?? '—'}</div>
            {!!active?.students?.length && (
              <div className="pt-2">
                <div className="text-xs font-bold text-muted-foreground">涉及学生</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.students.slice(0, 12).map((s) => (
                    <Link
                      key={s.id}
                      href={`/students/${s.id}`}
                      className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold hover:bg-white/80"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!!active?.samples?.length && (
              <div className="pt-2">
                <div className="text-xs font-bold text-muted-foreground">错题样例</div>
                <div className="mt-2 space-y-2">
                  {active.samples.slice(0, 6).map((s) => (
                    <div
                      key={s.id}
                      className="rounded-xl border-2 border-black bg-white/70 p-3 text-xs"
                    >
                      <div className="font-bold">
                        {s.studentName}{' '}
                        <span className="text-muted-foreground">
                          · {s.createdAt} · {percent(s.errorRate)}
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground">批次：{s.batchId}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground">
              原型说明：点击排行项后展示“涉及学生/错题样例”，用于演示下钻（Story 2.6）。
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
