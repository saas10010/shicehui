'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Download, Plus } from 'lucide-react'

import type { PdfJob, PdfJobType } from '@/lib/mock/types'
import { BrutalCard } from '@/components/brutal/brutal-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'

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

export function MaterialsCenter({ defaultStudentId }: { defaultStudentId?: string }) {
  const [jobs, setJobs] = React.useState<PdfJob[]>([])
  const [classId, setClassId] = React.useState('七年级1班')
  const [student, setStudent] = React.useState(defaultStudentId ? `学生ID：${defaultStudentId}` : '张晨（#001）')
  const [range, setRange] = React.useState('最近7天')

  React.useEffect(() => {
    setJobs(loadJobs())
  }, [])

  React.useEffect(() => {
    saveJobs(jobs)
  }, [jobs])

  const createJob = (type: PdfJobType, targetLabel: string) => {
    const job: PdfJob = {
      id: randomId('job'),
      type,
      targetLabel,
      rangeLabel: range,
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

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <h1 className="text-2xl font-black">资料中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          把学情数据转化为可交付物：全班题单/个人练习册/复习册（FR11/FR12）。
        </p>
      </BrutalCard>

      <Tabs defaultValue="class" className="w-full">
        <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
          <TabsTrigger value="class" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            全班题单
          </TabsTrigger>
          <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            个人资料
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
                <Input
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="border-2 border-black rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold">时间范围</div>
                <Input
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="border-2 border-black rounded-xl"
                />
              </div>
            </div>

            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => createJob('全班易错题单', classId)}
            >
              <Plus className="mr-2 h-4 w-4" />
              生成 PDF（原型）
            </Button>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="personal">
          <BrutalCard className="mt-4 p-5 space-y-4">
            <div className="text-lg font-black">生成个人练习册/复习册</div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-bold">学生</div>
                <Input
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="border-2 border-black rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold">时间范围</div>
                <Input
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="border-2 border-black rounded-xl"
                />
              </div>
            </div>

            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => createJob('个人练习册/复习册', student)}
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
                        <a href={`/api/materials/pdf?jobId=${j.id}`}>
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

