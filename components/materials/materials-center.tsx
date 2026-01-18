'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Download, Plus } from 'lucide-react'

import type { PdfJob, PdfJobType } from '@/lib/mock/types'
import { BrutalCard } from '@/components/brutal/brutal-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/status-badge'
import { CLASSES, STUDENTS } from '@/lib/mock/data'

const STORAGE_KEY = 'shicehui:pdfJobs'

function nowLabel() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}`
}

function loadJobs(): PdfJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PdfJob[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJobs(jobs: PdfJob[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
}

type DateRangePreset = '7d' | '30d' | 'all' | 'custom'

function formatYmd(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function labelForRange(range: DateRangePreset, start: string, end: string) {
  if (range === '7d') return '最近7天'
  if (range === '30d') return '最近30天'
  if (range === 'all') return '全部'
  return start && end ? `自定义：${start} ~ ${end}` : '自定义'
}

type PersonalDocKind = 'history' | 'variant'

function defaultRangeForPersonalDoc(kind: PersonalDocKind): DateRangePreset {
  return kind === 'variant' ? '7d' : '30d'
}

function outlineForPersonalDoc(kind: PersonalDocKind): string[] {
  if (kind === 'history') {
    return [
      '按时间范围汇总历史错题（按知识点分组）',
      '每题附「错因标签」与「纠错要点」',
      '高频错因排行榜（错因 → 对策）',
      '末尾 1 页「薄弱点清单」',
    ]
  }
  return [
    '基于错题生成变式题（同考点/同方法）',
    '难度分层：基础变式 → 进阶变式 → 拔高变式',
    '每题附「易错提醒」与「关键步骤」',
    '末尾 1 页「建议练习顺序」',
  ]
}

function downloadHrefForJob(job: PdfJob) {
  const params = new URLSearchParams()
  params.set('jobId', job.id)
  params.set('type', job.type)
  params.set('target', job.targetLabel)
  params.set('range', job.rangeLabel)
  if (job.outline?.length) params.set('outline', job.outline.join('\n'))
  return `/api/materials/pdf?${params.toString()}`
}

export function MaterialsCenter({
  defaultStudentId,
  embedded = false,
}: {
  defaultStudentId?: string
  embedded?: boolean
}) {
  const [jobs, setJobs] = React.useState<PdfJob[]>([])
  const [selectedClassId, setSelectedClassId] = React.useState(CLASSES[0]?.id ?? 'c-7-1')
  const [selectedStudentId, setSelectedStudentId] = React.useState(() => {
    if (defaultStudentId && STUDENTS.some((s) => s.id === defaultStudentId)) return defaultStudentId
    return STUDENTS[0]?.id ?? ''
  })
  const [personalDocKind, setPersonalDocKind] = React.useState<PersonalDocKind>('practice')
  const [range, setRange] = React.useState<DateRangePreset>('7d')
  const [startDraft, setStartDraft] = React.useState('')
  const [endDraft, setEndDraft] = React.useState('')

  React.useEffect(() => {
    if (defaultStudentId && STUDENTS.some((s) => s.id === defaultStudentId)) {
      setSelectedStudentId(defaultStudentId)
    }
  }, [defaultStudentId])

  React.useEffect(() => {
    const next = defaultRangeForPersonalDoc(personalDocKind)
    setRange(next)
    if (next !== 'custom') {
      setStartDraft('')
      setEndDraft('')
    }
  }, [personalDocKind])

  React.useEffect(() => {
    setJobs(loadJobs())
  }, [])

  React.useEffect(() => {
    saveJobs(jobs)
  }, [jobs])

  const createJob = (type: PdfJobType, targetLabel: string, outline?: string[]) => {
    if (range === 'custom') {
      if (!startDraft || !endDraft) {
        toast.error('请选择自定义起止日期')
        return
      }
      if (startDraft > endDraft) {
        toast.error('开始日期不能晚于结束日期')
        return
      }
    }

    const job: PdfJob = {
      id: randomId('job'),
      type,
      targetLabel,
      rangeLabel: labelForRange(range, startDraft, endDraft),
      outline,
      status: '生成中',
      createdAt: nowLabel(),
    }
    setJobs((prev) => [job, ...prev])
    toast.message(`已提交生成：${type}（原型模拟中...）`)

    window.setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: '已完成' } : j,
        ),
      )
      toast.success('生成完成（原型）')
    }, 1200)
  }

  const selectedStudent = STUDENTS.find((s) => s.id === selectedStudentId) ?? null
  const selectedStudentClassName =
    selectedStudent
      ? CLASSES.find((c) => c.id === selectedStudent.classId)?.name ?? selectedStudent.classId
      : ''
  const selectedStudentLabel = selectedStudent ? `${selectedStudent.name}（#${selectedStudent.code}）` : selectedStudentId
  const studentJobLabel =
    selectedStudent && selectedStudentClassName
      ? `${selectedStudentClassName} · ${selectedStudentLabel}`
      : selectedStudentLabel

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <BrutalCard className="p-5">
          <h1 className="text-2xl font-black">题单与册子</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            把学情数据转化为可交付物：全班题单/个人历史错题/错题变体（FR11/FR12）。
          </p>
        </BrutalCard>
      )}

      <Tabs defaultValue="class" className="w-full">
        <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
          <TabsTrigger value="class" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            全班题单
          </TabsTrigger>
          <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            个人册子
          </TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            生成记录（{jobs.length}）
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          <BrutalCard className="mt-4 p-5 space-y-4">
            <div className="text-lg font-black">生成全班共性易错题单</div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-bold">班级</div>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-10 border-2 border-black rounded-xl bg-white">
                    <SelectValue placeholder="选择班级" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black">
                    {CLASSES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold">时间范围</div>
                <Select
                  value={range}
                  onValueChange={(value) => {
                    const next = value as DateRangePreset
                    setRange(next)
                    if (next === 'custom' && !startDraft && !endDraft) {
                      const end = new Date()
                      const start = new Date(end)
                      start.setDate(end.getDate() - 6)
                      setStartDraft(formatYmd(start))
                      setEndDraft(formatYmd(end))
                    }
                  }}
                >
                  <SelectTrigger className="h-10 border-2 border-black rounded-xl bg-white">
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
            </div>

            {range === 'custom' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-bold">开始日期</div>
                  <Input
                    type="date"
                    value={startDraft}
                    onChange={(e) => setStartDraft(e.target.value)}
                    className="h-10 border-2 border-black rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold">结束日期</div>
                  <Input
                    type="date"
                    value={endDraft}
                    onChange={(e) => setEndDraft(e.target.value)}
                    className="h-10 border-2 border-black rounded-xl"
                  />
                </div>
              </div>
            )}

            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => {
                const className = CLASSES.find((c) => c.id === selectedClassId)?.name ?? selectedClassId
                createJob('全班易错题单', className)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              生成 PDF（原型）
            </Button>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="personal">
          <BrutalCard className="mt-4 p-5 space-y-4">
            <div className="text-lg font-black">生成个人历史错题 / 错题变体</div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={personalDocKind === 'history' ? 'default' : 'outline'}
                className={
                  personalDocKind === 'history'
                    ? 'rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'rounded-xl border-2 border-black font-bold'
                }
                onClick={() => setPersonalDocKind('history')}
              >
                个人历史错题
              </Button>
              <Button
                type="button"
                variant={personalDocKind === 'variant' ? 'default' : 'outline'}
                className={
                  personalDocKind === 'variant'
                    ? 'rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'rounded-xl border-2 border-black font-bold'
                }
                onClick={() => setPersonalDocKind('variant')}
              >
                个人错题变体
              </Button>
            </div>

            <div className="rounded-xl border-2 border-black bg-white/70 p-4">
              <div className="text-sm font-black">
                {personalDocKind === 'history' ? '历史错题：按知识点回顾与纠错' : '错题变体：同考点变式练习'}
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {outlineForPersonalDoc(personalDocKind).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-muted-foreground">
                默认时间范围：{personalDocKind === 'variant' ? '最近7天' : '最近30天'}（可手动调整）
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-bold">学生</div>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="h-10 border-2 border-black rounded-xl bg-white">
                    <SelectValue placeholder="选择学生" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black">
                    {STUDENTS.map((s) => {
                      const className = CLASSES.find((c) => c.id === s.classId)?.name ?? s.classId
                      return (
                        <SelectItem key={s.id} value={s.id}>
                          {className} · {s.name}（#{s.code}）
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold">时间范围</div>
                <Select
                  value={range}
                  onValueChange={(value) => {
                    const next = value as DateRangePreset
                    setRange(next)
                    if (next === 'custom' && !startDraft && !endDraft) {
                      const end = new Date()
                      const start = new Date(end)
                      start.setDate(end.getDate() - 6)
                      setStartDraft(formatYmd(start))
                      setEndDraft(formatYmd(end))
                    }
                  }}
                >
                  <SelectTrigger className="h-10 border-2 border-black rounded-xl bg-white">
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
            </div>

            {range === 'custom' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-bold">开始日期</div>
                  <Input
                    type="date"
                    value={startDraft}
                    onChange={(e) => setStartDraft(e.target.value)}
                    className="h-10 border-2 border-black rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold">结束日期</div>
                  <Input
                    type="date"
                    value={endDraft}
                    onChange={(e) => setEndDraft(e.target.value)}
                    className="h-10 border-2 border-black rounded-xl"
                  />
                </div>
              </div>
            )}

            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => {
                if (!selectedStudentId) {
                  toast.error('请选择学生')
                  return
                }
                const type: PdfJobType = personalDocKind === 'variant' ? '个人错题变体' : '个人历史错题'
                createJob(type, studentJobLabel, outlineForPersonalDoc(personalDocKind))
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              生成 PDF（原型）
            </Button>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="jobs">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">生成记录</div>
            <div className="mt-2 text-sm text-muted-foreground">
              异步任务队列：生成中/完成/失败，支持离开页面后继续查看（UI/UX 3.5/4.2.9）。
            </div>

            <div className="mt-4 space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="rounded-xl border-2 border-black bg-white/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-bold">
                        {j.type} · {j.targetLabel}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {j.createdAt} · 时间范围：{j.rangeLabel} · 任务ID：{j.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={j.status} />
                      <Button
                        variant="outline"
                        className="rounded-xl border-2 border-black font-bold"
                        asChild
                        disabled={j.status !== '已完成'}
                      >
                        <a href={downloadHrefForJob(j)}>
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {!jobs.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
                  暂无生成记录
                </div>
              )}
            </div>

            {jobs.length > 0 && (
              <Button
                variant="outline"
                className="mt-4 rounded-xl border-2 border-black font-bold"
                onClick={() => {
                  setJobs([])
                  toast.message('已清空生成记录（原型）')
                }}
              >
                清空记录
              </Button>
            )}
          </BrutalCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
