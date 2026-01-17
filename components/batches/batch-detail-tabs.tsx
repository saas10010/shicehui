'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

import type { BatchExceptionItem, BatchStudentItem, Student } from '@/lib/mock/types'
import { StatusBadge } from '@/components/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const draftStatusNeedsAttentionHelp =
  '该学生存在异常需先处理（缺码/识别冲突/码损坏等），处理后再确认。'

export function BatchDetailTabs({
  classId,
  batchId,
  students,
  studentItems,
  exceptions,
}: {
  classId: string
  batchId: string
  students: Student[]
  studentItems: BatchStudentItem[]
  exceptions: BatchExceptionItem[]
}) {
  const [selected, setSelected] = React.useState<Record<string, string>>({})

  // 最终归属（原型）：一个异常条目只能归属到一个学生；
  // 学生卡片中的“已归属异常”由异常条目的归属选择实时计算得出。
  const assignedExceptionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of exceptions) {
      const studentId = selected[e.id]
      if (!studentId) continue
      counts[studentId] = (counts[studentId] ?? 0) + 1
    }
    return counts
  }, [exceptions, selected])

  const assignedExceptionsTotal = React.useMemo(() => {
    return Object.values(assignedExceptionCounts).reduce((sum, n) => sum + n, 0)
  }, [assignedExceptionCounts])

  const unassignedExceptionsTotal = exceptions.length - assignedExceptionsTotal

  return (
    <TooltipProvider>
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
          <TabsTrigger
            value="students"
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            学生
          </TabsTrigger>
          <TabsTrigger
            value="exceptions"
            className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
          >
            异常（{exceptions.length}）
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              说明：可按学生查看处理状态；异常按“最终归属”统计（在异常 Tab 里选择归属后会实时更新）。
              {exceptions.length > 0 && (
                <span className="ml-2">
                  归属进度：已归属 {assignedExceptionsTotal}/{exceptions.length}
                  （未归属 {unassignedExceptionsTotal}）
                </span>
              )}
            </div>
            <Button
              asChild
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Link href={`/classes/${classId}/batches/${batchId}/grading`}>
                进入批改确认
              </Link>
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {studentItems.map((item) => {
              const assignedCount = assignedExceptionCounts[item.studentId] ?? 0
              return (
                <div
                  key={item.studentId}
                  className="rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black">{item.studentName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        作业张数：{item.imageCount} · 已归属异常：{assignedCount}
                      </div>
                    </div>
                    {item.draftStatus === '需处理' ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="shrink-0">
                            <StatusBadge status={item.draftStatus} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-80">
                          {draftStatusNeedsAttentionHelp}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <StatusBadge status={item.draftStatus} />
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-2 border-black font-bold"
                      asChild
                    >
                      <Link href={`/students/${item.studentId}`}>打开档案</Link>
                    </Button>
                    <Button
                      className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      onClick={() => toast.message('原型：已标记并进入下一位（占位）')}
                      disabled={item.draftStatus !== '可确认'}
                    >
                      快速确认
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="exceptions">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              说明：在此选择“最终归属”。选择后会同步影响学生 Tab 的“已归属异常”统计（原型演示）。
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => {
                  if (unassignedExceptionsTotal > 0) {
                    toast.message(
                      `还有 ${unassignedExceptionsTotal} 条异常未归属，建议先完成归属再保存（原型）`,
                    )
                    return
                  }
                  toast.success('已保存归属修正（原型未持久化）')
                }}
              >
                保存修正
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-2 border-black font-bold"
                onClick={() => {
                  setSelected({})
                  toast.message('已撤销本页选择（原型）')
                }}
              >
                撤销选择
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {exceptions.map((e) => {
              const assignedStudentId = selected[e.id]
              const assignedStudent = assignedStudentId
                ? students.find((s) => s.id === assignedStudentId) ?? null
                : null

              return (
                <div
                  key={e.id}
                  className="rounded-2xl border-4 border-black bg-white/70 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-black bg-white">
                      <Image
                        src={e.thumbnail}
                        alt={`异常作业缩略图：${e.reason}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-lg font-black">异常：{e.reason}</div>
                        <StatusBadge status="待处理" />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        异常ID：{e.id}
                        {assignedStudent && (
                          <span className="ml-2">
                            · 已归属：{assignedStudent.name}（#{assignedStudent.code}）
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="text-sm font-bold">归属到学生</div>
                        <Select
                          value={selected[e.id] ?? ''}
                          onValueChange={(v) =>
                            setSelected((prev) => ({ ...prev, [e.id]: v }))
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'mt-2 border-2 border-black rounded-xl bg-white',
                            )}
                          >
                            <SelectValue placeholder="请选择学生" />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-black">
                            {students.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}（#{s.code}）
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {e.suggestedStudentIds.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            建议：{e.suggestedStudentIds.join('、')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!exceptions.length && (
            <div className="mt-4 rounded-2xl border-4 border-black bg-white/60 p-6 text-center text-sm font-bold">
              当前批次无异常，可直接进入批改确认。
            </div>
          )}
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  )
}
