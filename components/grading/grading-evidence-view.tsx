'use client'

import * as React from 'react'
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type EvidenceSourceMode = '整份作业' | '按题证据'

export type EvidenceBox = {
  /** 百分比坐标：0-100 */
  x: number
  y: number
  w: number
  h: number
  label?: string
}

export type EvidencePage = {
  id: string
  label: string
  src: string
}

export type EvidenceQuestion = {
  id: string
  title: string
}

export type EvidenceItem = {
  id: string
  label: string
  src: string
  boxes?: EvidenceBox[]
}

export type EvidenceByQuestionId = Record<
  string,
  {
    pageIndex: number
    boxes: EvidenceBox[]
    items: EvidenceItem[]
  }
>

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0
  return Math.max(0, Math.min(index, length - 1))
}

function zoomUp(v: number) {
  if (v < 1) return 1
  if (v < 1.25) return 1.25
  if (v < 1.5) return 1.5
  if (v < 2) return 2
  return 2.5
}

function zoomDown(v: number) {
  if (v <= 1) return 1
  if (v <= 1.25) return 1
  if (v <= 1.5) return 1.25
  if (v <= 2) return 1.5
  return 2
}

export function GradingEvidenceView({
  resetKey,
  sourceMode,
  onSourceModeChange,
  linkageEnabled,
  onLinkageEnabledChange,
  questions,
  activeQuestionId,
  onActiveQuestionIdChange,
  pages,
  evidenceByQuestionId,
}: {
  resetKey: string
  sourceMode: EvidenceSourceMode
  onSourceModeChange: (v: EvidenceSourceMode) => void
  linkageEnabled: boolean
  onLinkageEnabledChange: (v: boolean) => void
  questions: EvidenceQuestion[]
  activeQuestionId: string | null
  onActiveQuestionIdChange: (id: string) => void
  pages: EvidencePage[]
  evidenceByQuestionId: EvidenceByQuestionId
}) {
  const [selectedPageIndex, setSelectedPageIndex] = React.useState(0)
  const [selectedItemIndexByQuestionId, setSelectedItemIndexByQuestionId] =
    React.useState<Record<string, number>>({})
  const [zoom, setZoom] = React.useState(1)
  const [rotate, setRotate] = React.useState(0)

  React.useEffect(() => {
    setSelectedPageIndex(0)
    setSelectedItemIndexByQuestionId({})
    setZoom(1)
    setRotate(0)
  }, [resetKey])

  React.useEffect(() => {
    if (!linkageEnabled) return
    if (!activeQuestionId) return
    const v = evidenceByQuestionId[activeQuestionId]
    if (!v) return

    if (sourceMode === '整份作业') {
      setSelectedPageIndex(clampIndex(v.pageIndex, pages.length))
      return
    }

    setSelectedItemIndexByQuestionId((prev) => ({ ...prev, [activeQuestionId]: 0 }))
  }, [
    activeQuestionId,
    evidenceByQuestionId,
    linkageEnabled,
    pages.length,
    sourceMode,
  ])

  const activeEvidence = activeQuestionId
    ? evidenceByQuestionId[activeQuestionId]
    : undefined

  const selectedEvidenceItemIndex = React.useMemo(() => {
    if (!activeQuestionId) return 0
    const current = selectedItemIndexByQuestionId[activeQuestionId]
    if (typeof current !== 'number') return 0
    return Math.max(0, current)
  }, [activeQuestionId, selectedItemIndexByQuestionId])

  const preview = React.useMemo(() => {
    if (sourceMode === '整份作业') {
      const page = pages[clampIndex(selectedPageIndex, pages.length)]
      if (!page) return null
      const boxes =
        activeQuestionId &&
        activeEvidence &&
        clampIndex(activeEvidence.pageIndex, pages.length) ===
          clampIndex(selectedPageIndex, pages.length)
          ? activeEvidence.boxes
          : []
      return { label: page.label, src: page.src, boxes }
    }

    if (!activeQuestionId || !activeEvidence) return null
    const items = activeEvidence.items ?? []
    const idx = clampIndex(selectedEvidenceItemIndex, items.length)
    const item = items[idx]
    if (!item) return null
    return { label: item.label, src: item.src, boxes: item.boxes ?? [] }
  }, [
    activeEvidence,
    activeQuestionId,
    pages,
    selectedEvidenceItemIndex,
    selectedPageIndex,
    sourceMode,
  ])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="rounded-2xl border-2 border-black bg-white/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black">证据视图（原型）</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            老师可切换“整份作业/按题证据”，并决定是否与题目联动定位。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-muted-foreground">联动定位</div>
          <Switch checked={linkageEnabled} onCheckedChange={onLinkageEnabledChange} />
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <div className="grid gap-2">
          <div className="text-xs font-bold text-muted-foreground">证据来源</div>
          <ToggleGroup
            type="single"
            value={sourceMode}
            onValueChange={(v) => {
              if (v !== '整份作业' && v !== '按题证据') return
              onSourceModeChange(v)
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="整份作业" aria-label="整份作业">
              整份作业
            </ToggleGroupItem>
            <ToggleGroupItem value="按题证据" aria-label="按题证据">
              按题证据
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-bold text-muted-foreground">当前题目</div>
          <ToggleGroup
            type="single"
            value={activeQuestionId ?? ''}
            onValueChange={(v) => {
              if (!v) return
              onActiveQuestionIdChange(v)
            }}
            className="flex-wrap justify-start"
          >
            {questions.map((q, idx) => (
              <ToggleGroupItem key={q.id} value={q.id} aria-label={q.title}>
                {idx + 1}题
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-muted-foreground">
            {preview ? `预览：${preview.label}` : '预览：—'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-xl border-2 border-black px-2"
              onClick={() => setZoom((v) => zoomDown(v))}
              aria-label="缩小"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="text-xs font-bold tabular-nums">{zoomPercent}%</div>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-xl border-2 border-black px-2"
              onClick={() => setZoom((v) => zoomUp(v))}
              aria-label="放大"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-xl border-2 border-black px-2"
              onClick={() => setRotate((v) => (v + 90) % 360)}
              aria-label="旋转"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {sourceMode === '整份作业' ? (
          <div className="grid gap-2">
            <div className="text-xs font-bold text-muted-foreground">
              页面缩略图（点击切换）
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pages.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className={cn(
                    'shrink-0 rounded-lg border-2 bg-white p-1 text-left',
                    idx === clampIndex(selectedPageIndex, pages.length)
                      ? 'border-black'
                      : 'border-black/30 hover:border-black',
                  )}
                  onClick={() => setSelectedPageIndex(idx)}
                >
                  <img
                    src={p.src}
                    alt={p.label}
                    className="h-20 w-14 rounded-md object-cover"
                  />
                  <div className="mt-1 text-[11px] font-bold">{p.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            <div className="text-xs font-bold text-muted-foreground">
              {activeQuestionId ? '题目证据（点击切换）' : '题目证据'}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(activeEvidence?.items ?? []).map((it, idx) => (
                <button
                  key={it.id}
                  type="button"
                  className={cn(
                    'shrink-0 rounded-lg border-2 bg-white p-1 text-left',
                    idx ===
                      clampIndex(selectedEvidenceItemIndex, activeEvidence?.items?.length ?? 0)
                      ? 'border-black'
                      : 'border-black/30 hover:border-black',
                  )}
                  onClick={() => {
                    if (!activeQuestionId) return
                    setSelectedItemIndexByQuestionId((prev) => ({
                      ...prev,
                      [activeQuestionId]: idx,
                    }))
                  }}
                >
                  <img
                    src={it.src}
                    alt={it.label}
                    className="h-20 w-28 rounded-md object-cover"
                  />
                  <div className="mt-1 text-[11px] font-bold">{it.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border-2 border-black bg-white">
          {preview ? (
            <div className="grid gap-2 p-2">
              <div className="relative max-h-[calc(100svh-320px)] w-full overflow-y-scroll overflow-x-auto rounded-lg border border-black/20 bg-white">
                <div
                  className="relative origin-top-left"
                  style={{
                    width: `${zoomPercent}%`,
                    transform: `rotate(${rotate}deg)`,
                    transformOrigin: 'top left',
                  }}
                >
                  <img
                    src={preview.src}
                    alt={preview.label}
                    className="block h-auto w-full select-none"
                    draggable={false}
                  />
                  {preview.boxes.map((b, i) => (
                    <div
                      key={`${i}-${b.x}-${b.y}-${b.w}-${b.h}`}
                      className="absolute rounded-md border-2 border-amber-600 bg-amber-200/20"
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.w}%`,
                        height: `${b.h}%`,
                      }}
                      aria-label={b.label ?? '证据高亮'}
                      title={b.label ?? '证据高亮'}
                    />
                  ))}
                </div>
              </div>

              {linkageEnabled ? (
                <div className="text-xs text-muted-foreground">
                  联动已开启：切换题目会自动定位到对应页面/证据，并在“整份作业”中高亮区域（预览区可滚动）。
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  联动已关闭：老师可手动选页/选证据进行核对（预览区可滚动）。
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              暂无可预览的证据（原型）。请选择题目/证据。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
