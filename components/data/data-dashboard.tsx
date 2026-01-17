'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BrutalCard } from '@/components/brutal/brutal-card'

type RankRow = {
  key: string
  title: string
  errorRate: number
  wrongCount: number
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function DataDashboard({
  questionRanks,
  knowledgeRanks,
}: {
  questionRanks: RankRow[]
  knowledgeRanks: RankRow[]
}) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState<RankRow | null>(null)
  const [range, setRange] = React.useState('最近7天')

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black">数据看板</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              按时间范围统计题目/知识点错误率排行（FR9/Story 2.6）。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="h-10 w-40 border-2 border-black rounded-xl"
              placeholder="例如：最近30天"
            />
            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => toast.message(`已应用时间范围：${range}（原型占位）`)}
            >
              应用
            </Button>
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
            <div className="text-xs text-muted-foreground">
              原型说明：此处可下钻到学生列表、错题样例与解析链接（UI/UX 4.2.7）。
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

