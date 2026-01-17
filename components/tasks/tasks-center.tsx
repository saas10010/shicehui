'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { CLASSES, STUDENTS } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

type TaskTargetType = 'class' | 'students'

type Task = {
  id: string
  title: string
  target?: string
  targetType?: TaskTargetType
  classId?: string
  studentIds?: string[]
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

function classNameOf(classId: string | undefined) {
  return CLASSES.find((c) => c.id === classId)?.name
}

function studentLabelOf(studentId: string) {
  const s = STUDENTS.find((it) => it.id === studentId)
  if (!s) return studentId
  return `${s.name}（#${s.code}）`
}

function summarizeStudents(studentIds: string[]) {
  const labels = studentIds.map(studentLabelOf)
  if (labels.length <= 2) return labels.join('、')
  return `${labels.slice(0, 2).join('、')}等${labels.length}人`
}

function targetLabelForTask(task: Task) {
  if (task.targetType === 'class') {
    const name = classNameOf(task.classId)
    return name ?? task.target ?? '未选择班级'
  }
  if (task.targetType === 'students') {
    const className = classNameOf(task.classId)
    const ids = Array.isArray(task.studentIds) ? task.studentIds : []
    const people = ids.length ? summarizeStudents(ids) : '未选择学生'
    if (className) return `${className} · ${people}`
    return people
  }
  return task.target ?? '未指定'
}

export function TasksCenter({ embedded = false }: { embedded?: boolean }) {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('巩固练习：合并同类项')
  const [targetType, setTargetType] = React.useState<TaskTargetType>('class')
  const [selectedClassId, setSelectedClassId] = React.useState(CLASSES[0]?.id ?? '')
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([])
  const [studentPickerOpen, setStudentPickerOpen] = React.useState(false)

  React.useEffect(() => {
    setTasks(loadTasks())
  }, [])

  React.useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  React.useEffect(() => {
    if (targetType !== 'students') return
    if (!selectedClassId) return
    setSelectedStudentIds((prev) =>
      prev.filter((id) => STUDENTS.some((s) => s.id === id && s.classId === selectedClassId)),
    )
  }, [selectedClassId, targetType])

  const studentsInClass = React.useMemo(() => {
    if (!selectedClassId) return []
    return STUDENTS.filter((s) => s.classId === selectedClassId)
  }, [selectedClassId])

  const canSubmit =
    targetType === 'class' ? !!selectedClassId : selectedStudentIds.length > 0

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
                    对象：{targetLabelForTask(t)} · 创建：{t.createdAt} · 任务ID：{t.id}
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
              if (!canSubmit) {
                toast.error('请选择下发对象')
                return
              }

              const clsName = classNameOf(selectedClassId)
              const targetLabel =
                targetType === 'class'
                  ? clsName ?? '未选择班级'
                  : `${clsName ?? ''}${clsName ? ' · ' : ''}${summarizeStudents(selectedStudentIds)}`

              const task: Task = {
                id: `task-${Math.random().toString(16).slice(2)}`,
                title: title.trim() || '巩固练习任务',
                target: targetLabel,
                targetType,
                classId: selectedClassId || undefined,
                studentIds: targetType === 'students' ? selectedStudentIds : undefined,
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
              <div className="text-sm font-bold">下发对象</div>
              <Tabs value={targetType} onValueChange={(v) => setTargetType(v as TaskTargetType)}>
                <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
                  <TabsTrigger
                    value="class"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    下发到班级
                  </TabsTrigger>
                  <TabsTrigger
                    value="students"
                    className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold"
                  >
                    下发到学生
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="class" className="mt-3">
                  <div className="space-y-2">
                    <div className="text-sm font-bold">选择班级</div>
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
                    <div className="text-xs text-muted-foreground">
                      班级下发会覆盖该班级全部学生（真实业务中通常会生成每个学生的领取/提交记录）。
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="mt-3">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm font-bold">所属班级</div>
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
                      <div className="flex items-end justify-between gap-3">
                        <div className="text-sm font-bold">选择学生（可多选）</div>
                        {selectedStudentIds.length ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-lg border-2 border-black px-2 text-xs font-bold"
                            onClick={() => setSelectedStudentIds([])}
                          >
                            清空
                          </Button>
                        ) : null}
                      </div>

                      <Popover open={studentPickerOpen} onOpenChange={setStudentPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-full justify-between rounded-xl border-2 border-black bg-white font-bold"
                          >
                            {selectedStudentIds.length
                              ? `已选择 ${selectedStudentIds.length} 人`
                              : '点击选择学生'}
                            <ChevronsUpDown className="h-4 w-4 opacity-70" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[360px] border-2 border-black p-0">
                          <Command>
                            <CommandInput placeholder="搜索学生姓名/学号…" />
                            <CommandList>
                              <CommandEmpty>没有匹配的学生</CommandEmpty>
                              <CommandGroup>
                                {studentsInClass.map((s) => {
                                  const checked = selectedStudentIds.includes(s.id)
                                  return (
                                    <CommandItem
                                      key={s.id}
                                      value={`${s.name} ${s.code}`}
                                      onSelect={() => {
                                        setSelectedStudentIds((prev) =>
                                          prev.includes(s.id)
                                            ? prev.filter((id) => id !== s.id)
                                            : [...prev, s.id],
                                        )
                                      }}
                                    >
                                      <Check className={cn('h-4 w-4', checked ? 'opacity-100' : 'opacity-0')} />
                                      <span className="ml-2 flex-1">
                                        {s.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        #{s.code}
                                      </span>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {selectedStudentIds.length ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedStudentIds.map((id) => (
                            <Badge
                              key={id}
                              variant="outline"
                              className="border-2 border-black bg-white text-foreground"
                            >
                              <span className="truncate max-w-[180px]">
                                {studentLabelOf(id)}
                              </span>
                              <button
                                type="button"
                                className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10"
                                onClick={() => setSelectedStudentIds((prev) => prev.filter((s) => s !== id))}
                                aria-label="移除学生"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          至少选择 1 名学生，后续才能按人统计完成情况。
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <Button
              disabled={!canSubmit}
              className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60"
            >
              确认下发
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
