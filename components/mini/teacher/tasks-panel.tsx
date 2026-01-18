'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { CLASSES, STUDENTS } from '@/lib/mock/data'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

type TaskTargetType = 'class' | 'students'

type Task = {
  id: string
  title: string
  targetType: TaskTargetType
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
    return classNameOf(task.classId) ?? '未选择班级'
  }
  const cls = classNameOf(task.classId)
  const ids = Array.isArray(task.studentIds) ? task.studentIds : []
  const people = ids.length ? summarizeStudents(ids) : '未选择学生'
  return cls ? `${cls} · ${people}` : people
}

function toneOfStatus(status: Task['status']) {
  return status === '已完成' ? 'success' : 'default'
}

export function MiniTasksPanel() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [title, setTitle] = React.useState('巩固练习：合并同类项')
  const [targetType, setTargetType] = React.useState<TaskTargetType>('class')
  const [selectedClassId, setSelectedClassId] = React.useState(CLASSES[0]?.id ?? '')
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([])

  React.useEffect(() => {
    setTasks(loadTasks())
  }, [])

  React.useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const studentsInClass = React.useMemo(() => {
    if (!selectedClassId) return []
    return STUDENTS.filter((s) => s.classId === selectedClassId)
  }, [selectedClassId])

  React.useEffect(() => {
    if (targetType !== 'students') return
    if (!selectedClassId) return
    setSelectedStudentIds((prev) => prev.filter((id) => studentsInClass.some((s) => s.id === id)))
  }, [selectedClassId, studentsInClass, targetType])

  const canSubmit =
    targetType === 'class' ? !!selectedClassId : selectedStudentIds.length > 0

  const create = () => {
    if (!canSubmit) {
      toast.error('请选择下发对象')
      return
    }
    const task: Task = {
      id: `task-${Math.random().toString(16).slice(2)}`,
      title: title.trim() || '巩固练习任务',
      targetType,
      classId: selectedClassId || undefined,
      studentIds: targetType === 'students' ? selectedStudentIds : undefined,
      status: '进行中',
      createdAt: nowLabel(),
    }
    setTasks((prev) => [task, ...prev])
    toast.success('已创建任务并下发（原型）')
  }

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">练习任务</div>
        <div className="mt-1 text-xs text-black/50">
          基于错题推荐同考点巩固题并下发任务（原型仅演示创建与状态）。
        </div>
      </WechatCard>

      <WechatCard className="p-4 space-y-3">
        <div className="text-sm font-medium text-black">创建任务（原型）</div>

        <div className="space-y-1">
          <div className="text-xs text-black/60">任务标题</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${targetType === 'class' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
            onClick={() => setTargetType('class')}
          >
            下发到班级
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${targetType === 'students' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
            onClick={() => setTargetType('students')}
          >
            下发到学生
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-black/60">选择班级</div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
          >
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {targetType === 'students' ? (
          <div className="space-y-2">
            <div className="text-xs text-black/60">选择学生（可多选）</div>
            <div className="max-h-40 overflow-auto rounded-xl border border-black/10 bg-white p-3">
              {studentsInClass.map((s) => {
                const checked = selectedStudentIds.includes(s.id)
                return (
                  <label key={s.id} className="flex items-center gap-2 py-1 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const nextChecked = e.target.checked
                        setSelectedStudentIds((prev) => {
                          if (nextChecked) return Array.from(new Set([...prev, s.id]))
                          return prev.filter((id) => id !== s.id)
                        })
                      }}
                    />
                    {s.name}（#{s.code}）
                  </label>
                )
              })}
              {!studentsInClass.length ? (
                <div className="text-sm text-black/50">该班暂无学生</div>
              ) : null}
            </div>
            <div className="text-xs text-black/50">
              已选：{selectedStudentIds.length} 人
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="w-full rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90 disabled:opacity-50"
          disabled={!canSubmit}
          onClick={create}
        >
          创建并下发
        </button>
      </WechatCard>

      <WechatCard>
        {tasks.map((t, idx) => (
          <React.Fragment key={t.id}>
            <WechatCell
              title={t.title}
              description={`对象：${targetLabelForTask(t)} · 创建：${t.createdAt}`}
              right={<WechatTag tone={toneOfStatus(t.status)}>{t.status}</WechatTag>}
              onClick={() => {
                setTasks((prev) =>
                  prev.map((it) =>
                    it.id === t.id
                      ? { ...it, status: it.status === '已完成' ? '进行中' : '已完成' }
                      : it,
                  ),
                )
                toast.message('已切换任务状态（原型）')
              }}
            />
            {idx === tasks.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}
        {!tasks.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无任务
          </div>
        ) : null}
      </WechatCard>
    </div>
  )
}

