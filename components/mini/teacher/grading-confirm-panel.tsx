'use client'

import * as React from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

import type { BatchStudentItem } from '@/lib/mock/types'
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

function safeWriteGradingConfirmed(batchId: string, ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(getGradingConfirmedKey(batchId), JSON.stringify(Array.from(ids)))
  } catch {
    // 忽略：原型演示不要求强一致
  }
}

type DraftUIStatus = '处理中' | '生成中' | '可确认'

type DraftEdits = {
  comment: string
}

function statusTone(status: DraftUIStatus | '已确认') {
  if (status === '已确认') return 'success'
  if (status === '可确认') return 'success'
  if (status === '生成中') return 'warning'
  return 'default'
}

export function MiniGradingConfirmPanel({
  classId,
  batchId,
  items,
}: {
  classId: string
  batchId: string
  items: BatchStudentItem[]
}) {
  const searchParams = useSearchParams()
  const requestedStudentId = searchParams.get('studentId') ?? ''

  const [draftStatusByStudentId, setDraftStatusByStudentId] = React.useState<Record<string, DraftUIStatus>>({})
  const [confirmedStudentIds, setConfirmedStudentIds] = React.useState<Set<string>>(() => safeReadGradingConfirmed(batchId))
  const generationTimersRef = React.useRef<Record<string, number>>({})

  const [activeStudentId, setActiveStudentId] = React.useState(() => {
    const initialConfirmed = safeReadGradingConfirmed(batchId)
    const requested =
      requestedStudentId && items.some((i) => i.studentId === requestedStudentId) ? requestedStudentId : ''
    if (requested) return requested
    const firstReady = items.find((i) => i.draftStatus === '可确认' && !initialConfirmed.has(i.studentId))?.studentId ?? ''
    if (firstReady) return firstReady
    const firstPending = items.find((i) => !initialConfirmed.has(i.studentId))?.studentId ?? ''
    return firstPending || items[0]?.studentId || ''
  })

  const draftEditsRef = React.useRef<Record<string, DraftEdits>>({})
  const prevActiveStudentIdRef = React.useRef<string | null>(null)

  const [comment, setComment] = React.useState('')

  const active = items.find((i) => i.studentId === activeStudentId) ?? null

  const getStudentDraftStatus = React.useCallback(
    (i: BatchStudentItem): DraftUIStatus => {
      const base: DraftUIStatus = i.draftStatus === '处理中' ? '处理中' : '可确认'
      return draftStatusByStudentId[i.studentId] ?? base
    },
    [draftStatusByStudentId],
  )

  React.useEffect(() => {
    setConfirmedStudentIds(safeReadGradingConfirmed(batchId))
  }, [batchId])

  const confirmedCount = React.useMemo(() => {
    const idSet = new Set(items.map((i) => i.studentId))
    let count = 0
    for (const id of confirmedStudentIds) {
      if (idSet.has(id)) count += 1
    }
    return count
  }, [confirmedStudentIds, items])

  const canConfirmIds = React.useMemo(() => {
    const ids: string[] = []
    for (const i of items) {
      if (confirmedStudentIds.has(i.studentId)) continue
      if (getStudentDraftStatus(i) !== '可确认') continue
      ids.push(i.studentId)
    }
    return ids
  }, [confirmedStudentIds, getStudentDraftStatus, items])

  const pendingCount = items.length - confirmedCount
  const canConfirmCount = canConfirmIds.length

  React.useEffect(() => {
    // 恢复“生成中”状态
    const now = Date.now()
    const record = safeReadDraftGeneration(batchId)
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
          const latest = safeReadDraftGeneration(batchId)
          const latestV = latest[studentId]
          if (latestV && typeof latestV.readyAt === 'number' && latestV.readyAt <= Date.now()) {
            delete latest[studentId]
            safeWriteDraftGeneration(batchId, latest)
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
  }, [batchId])

  React.useEffect(() => {
    // 在切换学生前保存当前编辑
    const prevId = prevActiveStudentIdRef.current
    if (prevId) {
      draftEditsRef.current[prevId] = { comment }
    }

    if (activeStudentId) {
      const saved = draftEditsRef.current[activeStudentId]
      if (saved) {
        setComment(saved.comment)
      } else {
        setComment('')
      }
    }

    prevActiveStudentIdRef.current = activeStudentId || null
  }, [activeStudentId])

  const findNextStudentId = React.useCallback(
    (currentId: string, opts?: { includeNotReady?: boolean }) => {
      const includeNotReady = Boolean(opts?.includeNotReady)
      const currentIndex = items.findIndex((i) => i.studentId === currentId)

      const isEligible = (i: BatchStudentItem) => {
        if (confirmedStudentIds.has(i.studentId)) return false
        const status = getStudentDraftStatus(i)
        if (status === '可确认') return true
        return includeNotReady
      }

      // 从当前项后面开始找一圈
      for (let offset = 1; offset <= items.length; offset += 1) {
        const idx = currentIndex >= 0 ? (currentIndex + offset) % items.length : offset % items.length
        const candidate = items[idx]
        if (!candidate) continue
        if (isEligible(candidate)) return candidate.studentId
      }

      // 兜底：找第一个符合条件的
      const fallback = items.find((i) => isEligible(i))?.studentId ?? ''
      return fallback
    },
    [confirmedStudentIds, getStudentDraftStatus, items],
  )

  function triggerDraftRegenerate(studentId: string) {
    const now = Date.now()
    const delay = 1200 + Math.floor(Math.random() * 800)
    const readyAt = now + delay

    setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '生成中' }))

    const record = safeReadDraftGeneration(batchId)
    record[studentId] = { readyAt }
    safeWriteDraftGeneration(batchId, record)

    const existing = generationTimersRef.current[studentId]
    if (existing) window.clearTimeout(existing)
    generationTimersRef.current[studentId] = window.setTimeout(() => {
      setDraftStatusByStudentId((prev) => ({ ...prev, [studentId]: '可确认' }))
      const latest = safeReadDraftGeneration(batchId)
      const latestV = latest[studentId]
      if (latestV && typeof latestV.readyAt === 'number' && latestV.readyAt <= Date.now()) {
        delete latest[studentId]
        safeWriteDraftGeneration(batchId, latest)
      }
    }, delay)
  }

  const activeDraftStatus: DraftUIStatus = active ? getStudentDraftStatus(active) : '处理中'
  const activeIsConfirmed = Boolean(active && confirmedStudentIds.has(active.studentId))
  const activeFinalStatus: DraftUIStatus | '已确认' = activeIsConfirmed ? '已确认' : activeDraftStatus

  const evidencePages = React.useMemo(() => {
    const base = ['/evidence/page-1.svg', '/evidence/page-2.svg', '/evidence/page-3.svg']
    const count = Math.max(1, active?.imageCount ?? 1)
    return Array.from({ length: count }, (_, idx) => ({
      id: `p${idx + 1}`,
      label: `第${idx + 1}页`,
      src: base[idx % base.length] ?? '/evidence/page-1.svg',
    }))
  }, [active?.imageCount])

  const evidenceMarks = React.useMemo(() => {
    const seed = activeStudentId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    return evidencePages.map((p, idx) => {
      const v = (seed + idx) % 5
      const mark: '对' | '错' = v === 0 ? '错' : '对'
      return { id: p.id, mark }
    })
  }, [activeStudentId, evidencePages])

  function confirmActiveAndMaybeNext(behavior: 'stay' | 'next') {
    if (!activeStudentId) return
    if (activeIsConfirmed) return
    if (activeDraftStatus !== '可确认') return

    draftEditsRef.current[activeStudentId] = { comment }
    setConfirmedStudentIds((prev) => {
      const next = new Set(prev)
      next.add(activeStudentId)
      safeWriteGradingConfirmed(batchId, next)
      return next
    })

    if (behavior === 'stay') {
      toast.success('已确认（原型）')
      return
    }

    const nextReadyId = findNextStudentId(activeStudentId, { includeNotReady: false })
    const nextId = nextReadyId || findNextStudentId(activeStudentId, { includeNotReady: true })
    if (!nextId || nextId === activeStudentId) {
      toast.success('已确认，本批次已没有下一位（原型）')
      return
    }

    setActiveStudentId(nextId)
    toast.success('已确认，已切换到下一位（原型）')
  }

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">批改确认</div>
            <div className="mt-1 text-xs text-black/50">
              证据图上直接显示对/错（示例）。点“确认并下一位”即可连续处理。
            </div>
            <div className="mt-2 text-xs text-black/50">
              进度：已确认 {confirmedCount}/{items.length} · 待确认 {pendingCount} · 当前可确认 {canConfirmCount}
            </div>
            <div className="mt-2 text-xs text-black/60">
              当前：{active ? `${active.studentName} · 作业张数：${active.imageCount}` : '—'}
            </div>
          </div>
          <WechatTag tone={statusTone(activeFinalStatus)}>{activeFinalStatus}</WechatTag>
        </div>

        {items.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs text-black/50">切换学生（可选）</div>
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
            >
              {items.map((i) => {
                const isConfirmed = confirmedStudentIds.has(i.studentId)
                const status = isConfirmed ? '已确认' : getStudentDraftStatus(i)
                return (
                  <option key={i.studentId} value={i.studentId}>
                    {i.studentName}（{status}）
                  </option>
                )
              })}
            </select>
          </div>
        ) : null}

        <div className="mt-3">
          <Link
            href={`/mini/teacher/classes/${classId}/batches/${batchId}`}
            className="text-sm text-[#07c160]"
          >
            ← 返回批次详情
          </Link>
        </div>
      </WechatCard>

      {!active ? (
        <WechatCard className="p-6 text-center">
          <div className="text-sm text-black/50">暂无可批改的学生</div>
        </WechatCard>
      ) : (
        <div className="space-y-4">
	          <WechatCard className="p-4 space-y-2">
	            <div className="text-sm font-medium text-black">证据（示例：对/错直接叠在图上）</div>
	            <div className="grid grid-cols-3 gap-2">
	              {evidencePages.map((p, idx) => {
	                const mark = evidenceMarks[idx]?.mark ?? '对'
	                const isWrong = mark === '错'
	                return (
	                  <a
	                    key={p.id}
	                    href={p.src}
	                    target="_blank"
	                    rel="noreferrer"
	                    className="rounded-xl border border-black/10 bg-white p-2 text-center text-xs text-black/60 active:bg-black/5"
	                  >
	                    <div className="relative">
	                      <img src={p.src} alt={p.label} className="mx-auto h-16 w-full rounded-lg object-cover" />
	                      <div
	                        className={`absolute left-1 top-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${isWrong ? 'bg-red-500' : 'bg-emerald-500'}`}
	                      >
	                        {isWrong ? '错' : '对'}
	                      </div>
	                    </div>
	                    <div className="mt-1">{p.label}</div>
	                  </a>
	                )
	              })}
	            </div>
            <div className="text-xs text-black/50">
              点击图片可查看大图（示例）。真实系统可在大图内展示题目框、对错标记与溯源信息。
            </div>
          </WechatCard>

          <WechatCard className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-black">备注/订正点（可选）</div>
              <textarea
                value={comment}
                disabled={activeIsConfirmed}
                onChange={(e) => setComment(e.target.value)}
                placeholder="例如：第3题移项要变号。"
                className="min-h-16 w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#07c160]/20"
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
                  onClick={() => {
                    if (!activeStudentId) return
                    setConfirmedStudentIds((prev) => {
                      const next = new Set(prev)
                      next.delete(activeStudentId)
                      safeWriteGradingConfirmed(batchId, next)
                      return next
                    })
                    triggerDraftRegenerate(activeStudentId)
                    setComment('')
                    toast.success('已触发重新识别，正在生成（原型）')
                  }}
                >
                  重新识别
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90 disabled:opacity-50"
                  disabled={activeIsConfirmed || activeDraftStatus !== '可确认'}
                  onClick={() => confirmActiveAndMaybeNext('next')}
                >
                  {activeIsConfirmed ? '已确认' : activeDraftStatus !== '可确认' ? '等待生成' : '确认并下一位'}
                </button>
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5 disabled:opacity-50"
                disabled={activeIsConfirmed || activeDraftStatus !== '可确认'}
                onClick={() => confirmActiveAndMaybeNext('stay')}
              >
                仅确认（停留在当前）
              </button>

              {activeIsConfirmed ? (
                <button
                  type="button"
                  className="w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
                  onClick={() => {
                    if (!activeStudentId) return
                    setConfirmedStudentIds((prev) => {
                      const next = new Set(prev)
                      next.delete(activeStudentId)
                      safeWriteGradingConfirmed(batchId, next)
                      return next
                    })
                    toast.message('已撤销确认，可继续处理（原型）')
                  }}
                >
                  撤销确认
                </button>
              ) : null}
            </div>
          </WechatCard>
        </div>
      )}
    </div>
  )
}
