'use client'

import * as React from 'react'
import { toast } from 'sonner'

import type { PdfJob, PdfJobType } from '@/lib/mock/types'
import { CLASSES, STUDENTS } from '@/lib/mock/data'
import { WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

const STORAGE_KEY = 'shicehui:pdfJobs'

type DateRangePreset = '7d' | '30d' | 'all' | 'custom'
type MaterialsMode = 'class' | 'personal'

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

function toneOfJob(status: PdfJob['status']) {
  if (status === '已完成') return 'success'
  if (status === '失败') return 'danger'
  return 'warning'
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

export function MiniMaterialsPanel({
  defaultStudentId,
  defaultClassId,
  defaultMode,
}: {
  defaultStudentId?: string
  defaultClassId?: string
  defaultMode?: MaterialsMode
}) {
  const [jobs, setJobs] = React.useState<PdfJob[]>([])

  const [range, setRange] = React.useState<DateRangePreset>('7d')
  const [startDraft, setStartDraft] = React.useState('')
  const [endDraft, setEndDraft] = React.useState('')

  const lockedClassId = defaultClassId && CLASSES.some((c) => c.id === defaultClassId) ? defaultClassId : ''
  const isClassLocked = Boolean(lockedClassId)

  const [mode, setMode] = React.useState<MaterialsMode>(() => {
    if (defaultMode) return defaultMode
    if (defaultStudentId) return 'personal'
    return 'class'
  })

  const [selectedClassId, setSelectedClassId] = React.useState(() => lockedClassId || CLASSES[0]?.id || '')

  const availableStudents = React.useMemo(() => {
    if (lockedClassId) return STUDENTS.filter((s) => s.classId === lockedClassId)
    return STUDENTS
  }, [lockedClassId])

  const [selectedStudentId, setSelectedStudentId] = React.useState(() => {
    if (defaultStudentId && availableStudents.some((s) => s.id === defaultStudentId)) return defaultStudentId
    return availableStudents[0]?.id ?? ''
  })

  React.useEffect(() => {
    setJobs(loadJobs())
  }, [])

  React.useEffect(() => {
    saveJobs(jobs)
  }, [jobs])

  React.useEffect(() => {
    if (!lockedClassId) return
    setSelectedClassId(lockedClassId)
  }, [lockedClassId])

  React.useEffect(() => {
    if (!availableStudents.length) return
    if (availableStudents.some((s) => s.id === selectedStudentId)) return
    setSelectedStudentId(availableStudents[0]!.id)
  }, [availableStudents, selectedStudentId])

  React.useEffect(() => {
    if (!defaultStudentId) return
    if (!availableStudents.some((s) => s.id === defaultStudentId)) return
    setSelectedStudentId(defaultStudentId)
  }, [defaultStudentId, availableStudents])

  const ensureCustomDates = () => {
    if (range !== 'custom') return true
    if (!startDraft || !endDraft) {
      toast.error('请选择自定义起止日期')
      return false
    }
    if (startDraft > endDraft) {
      toast.error('开始日期不能晚于结束日期')
      return false
    }
    return true
  }

  const createJob = (type: PdfJobType, targetLabel: string, outline?: string[]) => {
    if (!ensureCustomDates()) return

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
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: '已完成' } : j)))
      toast.success('生成完成（原型）')
    }, 1200)
  }

  const selectedClass = CLASSES.find((c) => c.id === selectedClassId) ?? null
  const selectedStudent = availableStudents.find((s) => s.id === selectedStudentId) ?? null
  const studentClass = selectedStudent ? CLASSES.find((c) => c.id === selectedStudent.classId) ?? null : null
  const studentLabel = selectedStudent ? `${selectedStudent.name}（#${selectedStudent.code}）` : '未选择学生'
  const studentTargetLabel = studentClass ? `${studentClass.name} · ${studentLabel}` : studentLabel
  const studentClassLabel = studentClass?.name ?? ''

  return (
    <div>
      <div className="p-4">
        <div className="text-sm font-medium text-black">题单与册子</div>
        <div className="mt-1 text-xs text-black/50">
          把学情数据转化为可交付物：全班题单 / 个人历史错题 / 个人错题变体（原型）。
        </div>
        <div className="mt-3 flex rounded-xl bg-black/5 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'class' ? 'bg-white text-black shadow-sm' : 'text-black/60'}`}
            onClick={() => setMode('class')}
          >
            全班题单
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${mode === 'personal' ? 'bg-white text-black shadow-sm' : 'text-black/60'}`}
            onClick={() => setMode('personal')}
          >
            个人册子
          </button>
        </div>
        <div className="mt-2 text-xs text-black/50">
          {mode === 'class' ? '面向全班：选择班级与时间范围。' : '面向个人：选择学生与时间范围。'}
          {isClassLocked && selectedClass ? `（已锁定：${selectedClass.name}）` : null}
        </div>
      </div>
      <WechatDivider />

      <div className="p-4 space-y-3">
        <div className="text-sm font-medium text-black">生成参数</div>

        {mode === 'class' ? (
          <div className="space-y-1">
            <div className="text-xs text-black/60">班级</div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={isClassLocked}
              className={`w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20 ${isClassLocked ? 'opacity-60' : ''}`}
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xs text-black/60">学生</div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
            >
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {CLASSES.find((c) => c.id === s.classId)?.name ?? '未知班级'} · {s.name}（#{s.code}）
                </option>
              ))}
            </select>
            {selectedStudent && studentClassLabel ? (
              <div className="text-xs text-black/40">所属班级：{studentClassLabel}</div>
            ) : null}
          </div>
        )}

        <div className={`grid gap-3 ${range === 'custom' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-1">
            <div className="text-xs text-black/60">时间范围</div>
            <select
              value={range}
              onChange={(e) => {
                const next = e.target.value as DateRangePreset
                setRange(next)
                if (next === 'custom' && !startDraft && !endDraft) {
                  const end = new Date()
                  const start = new Date(end)
                  start.setDate(end.getDate() - 6)
                  setStartDraft(formatYmd(start))
                  setEndDraft(formatYmd(end))
                }
                if (next !== 'custom') {
                  setStartDraft('')
                  setEndDraft('')
                }
              }}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
            >
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="all">全部</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          {range === 'custom' ? (
            <div className="space-y-1">
              <div className="text-xs text-black/60">自定义日期</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDraft}
                  onChange={(e) => setStartDraft(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
                />
                <input
                  type="date"
                  value={endDraft}
                  onChange={(e) => setEndDraft(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
                />
              </div>
            </div>
          ) : null}
        </div>

        {mode === 'class' ? (
          <button
            type="button"
            className="w-full rounded-xl bg-[#07c160] px-3 py-3 text-center text-sm font-semibold text-white active:opacity-90"
            onClick={() => {
              if (!selectedClass) {
                toast.error('请选择班级')
                return
              }
              createJob('全班易错题单', selectedClass.name)
            }}
          >
            生成全班题单
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
              onClick={() => {
                if (!selectedStudent) {
                  toast.error('请选择学生')
                  return
                }
                createJob('个人历史错题', studentTargetLabel)
              }}
            >
              生成历史错题
            </button>
            <button
              type="button"
              className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
              onClick={() => {
                if (!selectedStudent) {
                  toast.error('请选择学生')
                  return
                }
                createJob('个人错题变体', studentTargetLabel)
              }}
            >
              生成错题变体
            </button>
          </div>
        )}
      </div>

      <WechatDivider />
      <div className="p-4">
        <div className="text-sm font-medium text-black">生成记录</div>
        <div className="mt-1 text-xs text-black/50">已完成的记录可点击下载占位文件</div>
      </div>
      <WechatDivider />
      <div>
        {jobs.map((j, idx) => (
          <React.Fragment key={j.id}>
            <WechatCell
              title={`${j.type} · ${j.targetLabel}`}
              description={`${j.createdAt} · ${j.status} · ${j.rangeLabel}`}
              right={<WechatTag tone={toneOfJob(j.status)}>{j.status}</WechatTag>}
              href={j.status === '已完成' ? downloadHrefForJob(j) : undefined}
            />
            {idx === jobs.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}
        {!jobs.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无生成记录
          </div>
        ) : null}
      </div>

      <WechatDivider />
      <div className="p-4">
        <div className="text-xs text-black/50">
          原型说明：真实系统应返回 PDF 并支持队列、失败重试与权限控制（FR11/FR12）。
        </div>
      </div>
    </div>
  )
}
