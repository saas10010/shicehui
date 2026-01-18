'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { Batch, BatchExceptionItem, BatchStudentItem, Student } from '@/lib/mock/types'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

type DraftGenerationRecord = Record<string, { readyAt: number }>

function getDraftGenerationKey(batchId: string) {
  return `shicehui:draft-generation:${batchId}`
}

function getGradingConfirmedKey(batchId: string) {
  return `shicehui:grading-confirmed:${batchId}`
}

function safeReadDraftGeneration(batchId: string): DraftGenerationRecord {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(getDraftGenerationKey(batchId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as DraftGenerationRecord
  } catch {
    return {}
  }
}

function safeWriteDraftGeneration(batchId: string, record: DraftGenerationRecord) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(getDraftGenerationKey(batchId), JSON.stringify(record))
  } catch {
    // 忽略：原型演示不要求强一致
  }
}

function safeReadGradingConfirmed(batchId: string) {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const raw = window.sessionStorage.getItem(getGradingConfirmedKey(batchId))
    if (!raw) return new Set<string>()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set<string>()
    return new Set(parsed.filter((x) => typeof x === 'string'))
  } catch {
    return new Set<string>()
  }
}

type DraftUIStatus = '处理中' | '生成中' | '可确认'

function labelOfStatus(status: DraftUIStatus | '已确认') {
  return status
}

function toneOfStatus(status: DraftUIStatus | '已确认') {
  if (status === '已确认') return 'success'
  if (status === '可确认') return 'success'
  if (status === '生成中') return 'warning'
  return 'default'
}

type TabKey = 'students' | 'exceptions'

export function BatchDetailPanel({
  classId,
  batch,
  students,
  studentItems,
  exceptions,
}: {
  classId: string
  batch: Batch
  students: Student[]
  studentItems: BatchStudentItem[]
  exceptions: BatchExceptionItem[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = (searchParams.get('tab') as TabKey) || 'students'

  // 异常归属（原型）：
  // - selected：编辑态（未保存）
  // - saved：最终归属（用于统计口径）
  const [selected, setSelected] = React.useState<Record<string, string>>({})
  const [saved, setSaved] = React.useState<Record<string, string>>({})

  const [draftStatusByStudentId, setDraftStatusByStudentId] = React.useState<Record<string, DraftUIStatus>>({})
  const [confirmedStudentIds, setConfirmedStudentIds] = React.useState<Set<string>>(() => new Set())
  const generationTimersRef = React.useRef<Record<string, number>>({})

  React.useEffect(() => {
    // 恢复“生成中”状态（用于从批改确认返回时继续演示）
    const now = Date.now()
    const record = safeReadDraftGeneration(batch.id)
    const next: Record<string, DraftUIStatus> = {}
    for (const [studentId, v] of Object.entries(record)) {
      if (!v || typeof v.readyAt !== 'number') continue
      next[studentId] = v.readyAt > now ? '生成中' : '可确认'
      if (v.readyAt > now) {
        const delay = Math.max(0, v.readyAt - now)
        const existing = generationTimersRef.current[studentId]
        if (existing) window.clearTimeout(existing)
        generationTimersRef.current[studentId] = window.setTimeout(() => {
          setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
          const latest = safeReadDraftGeneration(batch.id)
          const latestV = latest[studentId]
          if (latestV && typeof latestV.readyAt === 'number' && latestV.readyAt <= Date.now()) {
            delete latest[studentId]
            safeWriteDraftGeneration(batch.id, latest)
          }
        }, delay)
      }
    }
    if (Object.keys(next).length > 0) setDraftStatusByStudentId(next)

    return () => {
      for (const timerId of Object.values(generationTimersRef.current)) {
        window.clearTimeout(timerId)
      }
      generationTimersRef.current = {}
    }
  }, [batch.id])

  React.useEffect(() => {
    const refresh = () => setConfirmedStudentIds(safeReadGradingConfirmed(batch.id))
    refresh()
    window.addEventListener('focus', refresh)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [batch.id])

  const assignedExceptionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of exceptions) {
      const studentId = saved[e.id]
      if (!studentId) continue
      counts[studentId] = (counts[studentId] ?? 0) + 1
    }
    return counts
  }, [exceptions, saved])

  const assignedExceptionsTotal = React.useMemo(() => {
    return Object.values(assignedExceptionCounts).reduce((sum, n) => sum + n, 0)
  }, [assignedExceptionCounts])

  const unassignedExceptionsTotal = exceptions.length - assignedExceptionsTotal

  const hasUnsavedChanges = React.useMemo(() => {
    const aKeys = Object.keys(selected)
    for (const key of aKeys) {
      if (selected[key] !== saved[key]) return true
    }
    // 反向检查：saved 中存在但 selected 不存在
    const bKeys = Object.keys(saved)
    for (const key of bKeys) {
      if (selected[key] !== saved[key]) return true
    }
    return false
  }, [saved, selected])

  function triggerDraftGenerationForStudents(studentIds: string[]) {
    const now = Date.now()
    const record = safeReadDraftGeneration(batch.id)
    const uniqueIds = Array.from(new Set(studentIds)).filter(Boolean)
    if (uniqueIds.length === 0) return

    setDraftStatusByStudentId((prev) => {
      const next = { ...prev }
      for (const id of uniqueIds) next[id] = '生成中'
      return next
    })

    for (const studentId of uniqueIds) {
      const existingTimer = generationTimersRef.current[studentId]
      if (existingTimer) window.clearTimeout(existingTimer)

      const delay = 1200 + Math.floor(Math.random() * 800)
      const readyAt = now + delay
      record[studentId] = { readyAt }

      generationTimersRef.current[studentId] = window.setTimeout(() => {
        setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
        const latest = safeReadDraftGeneration(batch.id)
        const v = latest[studentId]
        if (v && typeof v.readyAt === 'number' && v.readyAt <= Date.now()) {
          delete latest[studentId]
          safeWriteDraftGeneration(batch.id, latest)
        }
      }, delay)
    }

    safeWriteDraftGeneration(batch.id, record)
  }

  const headerStat = `${batch.createdAt} · 来源：${batch.source} · 异常 ${batch.exceptionImages} · 已处理 ${batch.processedImages}/${batch.totalImages}`

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">{batch.title}</div>
        <div className="mt-1 text-xs text-black/50">{headerStat}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href={`/mini/teacher/classes/${classId}/batches/${batch.id}?tab=students`}
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${tab === 'students' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
          >
            学生
          </Link>
          <Link
            href={`/mini/teacher/classes/${classId}/batches/${batch.id}?tab=exceptions`}
            className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${tab === 'exceptions' ? 'bg-[#07c160] text-white' : 'bg-white text-black ring-1 ring-black/10 active:bg-black/5'}`}
          >
            异常（{exceptions.length}）
          </Link>
        </div>
      </WechatCard>

      {tab === 'students' ? (
        <div className="space-y-4">
          <WechatCard className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-black/50">
                归属进度：已保存 {assignedExceptionsTotal}/{exceptions.length}
                {exceptions.length > 0 ? `（未保存 ${unassignedExceptionsTotal}）` : ''}
                {hasUnsavedChanges ? ' · 有未保存修改' : ''}
              </div>
              <Link
                href={`/mini/teacher/classes/${classId}/batches/${batch.id}/grading`}
                className="text-sm font-semibold text-[#07c160]"
              >
                批改确认 →
              </Link>
            </div>
          </WechatCard>

          <WechatCard>
            {studentItems.map((item, idx) => {
              const assignedCount = assignedExceptionCounts[item.studentId] ?? 0
              const isConfirmed = confirmedStudentIds.has(item.studentId)
              const base: DraftUIStatus = item.draftStatus === '处理中' ? '处理中' : '可确认'
              const draftDisplayStatus = draftStatusByStudentId[item.studentId] ?? base
              const statusToShow: DraftUIStatus | '已确认' = isConfirmed ? '已确认' : draftDisplayStatus

              return (
                <React.Fragment key={item.studentId}>
                  <WechatCell
                    title={item.studentName}
                    description={`作业张数：${item.imageCount} · 已归属异常：${assignedCount}`}
                    right={<WechatTag tone={toneOfStatus(statusToShow)}>{labelOfStatus(statusToShow)}</WechatTag>}
                    href={`/mini/teacher/classes/${classId}/batches/${batch.id}/grading?studentId=${encodeURIComponent(item.studentId)}`}
                  />
                  <WechatDivider />
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/mini/teacher/students/${item.studentId}?classId=${encodeURIComponent(classId)}`}
                        className="text-xs text-[#07c160]"
                      >
                        打开档案
                      </Link>
                      <button
                        type="button"
                        className="text-xs text-black/60"
                        onClick={() => {
                          router.push(`/mini/teacher/classes/${classId}/batches/${batch.id}/grading?studentId=${encodeURIComponent(item.studentId)}`)
                        }}
                      >
                        快速确认（进入批改确认）
                      </button>
                    </div>
                  </div>
                  {idx === studentItems.length - 1 ? null : <WechatDivider />}
                </React.Fragment>
              )
            })}

            {!studentItems.length ? (
              <div className="px-4 py-10 text-center text-sm text-black/50">
                暂无学生条目
              </div>
            ) : null}
          </WechatCard>
        </div>
      ) : (
        <div className="space-y-4">
          <WechatCard className="p-4">
            <div className="text-xs text-black/50">
              在此选择“最终归属”。保存后将触发相关学生的初稿重新生成（原型模拟：生成中→可确认）。
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90"
                onClick={() => {
                  const nextSaved = { ...saved, ...selected }
                  const assignedTotal = exceptions.filter((e) => !!nextSaved[e.id]).length
                  if (assignedTotal <= 0) {
                    toast.message('请先为至少 1 条异常选择归属再保存（原型）')
                    return
                  }

                  const affectedStudentIds = Array.from(
                    new Set(
                      exceptions
                        .map((e) => nextSaved[e.id])
                        .filter((x): x is string => typeof x === 'string' && x.length > 0),
                    ),
                  )

                  setSaved(nextSaved)
                  setSelected(nextSaved)
                  toast.success('已保存归属修正（原型）')
                  triggerDraftGenerationForStudents(affectedStudentIds)
                  router.replace(`/mini/teacher/classes/${classId}/batches/${batch.id}?tab=students`, { scroll: false })
                }}
              >
                保存修正
              </button>
              <button
                type="button"
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
                onClick={() => {
                  setSelected(saved)
                  toast.message('已撤销未保存修改（原型）')
                }}
              >
                撤销选择
              </button>
            </div>
          </WechatCard>

          {exceptions.map((e) => {
            const savedStudentId = saved[e.id]
            const savedStudent = savedStudentId ? students.find((s) => s.id === savedStudentId) ?? null : null
            const selectedStudentId = selected[e.id]
            const selectedStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) ?? null : null
            const currentValue = selectedStudentId ?? savedStudentId ?? ''

            return (
              <WechatCard key={e.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-black">异常：{e.reason}</div>
                    <div className="mt-1 text-xs text-black/50">
                      异常ID：{e.id}
                      {savedStudent ? ` · 已保存归属：${savedStudent.name}（#${savedStudent.code}）` : ''}
                      {!savedStudent && selectedStudent ? ` · 未保存归属：${selectedStudent.name}` : ''}
                    </div>
                  </div>
                  <WechatTag tone="warning">待处理</WechatTag>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={e.thumbnail}
                    alt={`异常作业缩略图：${e.reason}`}
                    className="h-16 w-16 rounded-xl border border-black/10 bg-white object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-black">归属到学生</div>
                    <select
                      value={currentValue}
                      onChange={(ev) => setSelected((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                      className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
                    >
                      <option value="">请选择学生</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}（#{s.code}）
                        </option>
                      ))}
                    </select>
                    {e.suggestedStudentIds.length > 0 ? (
                      <div className="mt-2 text-xs text-black/50">
                        建议：{e.suggestedStudentIds.join('、')}
                      </div>
                    ) : null}
                  </div>
                </div>
              </WechatCard>
            )
          })}

          {!exceptions.length ? (
            <WechatCard className="p-6 text-center">
              <div className="text-sm font-medium text-black">
                当前批次无异常，可直接进入批改确认。
              </div>
            </WechatCard>
          ) : null}
        </div>
      )}
    </div>
  )
}

