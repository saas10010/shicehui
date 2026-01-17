'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'

type Task = {
  id: string
  title: string
  target: string
  status: '进行中' | '已完成'
  createdAt: string
}

const STORAGE_KEY = 'shicehui:tasks'

function nowLabel() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function TasksCenter({ embedded = false }: { embedded?: boolean }) {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('巩固练习：合并同类项')
  const [target, setTarget] = React.useState('七年级1班')

  React.useEffect(() => {
    setTasks(loadTasks())
  }, [])

  React.useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <BrutalCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black">练习任务</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                基于错题推荐同考点巩固题并下发任务（FR13/FR14）。原型仅演示创建与状态。
              </p>
            </div>
            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              创建任务
            </Button>
          </div>
        </BrutalCard>
      )}

      <BrutalCard className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-black">{embedded ? '练习任务' : '任务列表'}</div>
            {embedded ? (
              <div className="mt-1 text-sm text-muted-foreground">
                基于错题推荐同考点巩固题并下发任务（FR13/FR14）。原型仅演示创建与状态。
              </div>
            ) : null}
          </div>
          {embedded ? (
            <Button
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              创建任务
            </Button>
          ) : null}
        </div>
        <div className="mt-4 space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-xl border-2 border-black bg-white/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-bold">{t.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    对象：{t.target} · 创建：{t.createdAt} · 任务ID：{t.id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <Button
                    variant="outline"
                    className="rounded-xl border-2 border-black font-bold"
                    onClick={() => toast.message('原型：打开完成统计（占位）')}
                  >
                    完成统计
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!tasks.length && (
            <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
              暂无任务
            </div>
          )}
        </div>
      </BrutalCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-black">创建练习任务（原型）</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const task: Task = {
                id: `task-${Math.random().toString(16).slice(2)}`,
                title: title.trim() || '巩固练习任务',
                target: target.trim() || '七年级1班',
                status: '进行中',
                createdAt: nowLabel(),
              }
              setTasks((prev) => [task, ...prev])
              toast.success('已创建任务并下发（原型模拟）')
              setOpen(false)
            }}
          >
            <div className="space-y-2">
              <div className="text-sm font-bold">任务标题</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-black rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold">下发对象（班级/学生）</div>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} className="border-2 border-black rounded-xl" />
            </div>
            <Button className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              确认下发
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
