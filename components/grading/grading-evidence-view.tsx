'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { RotateCw, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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

export type EvidenceByQuestionId = Record<
  string,
  {
    pageIndex: number
  }
>

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0
  return Math.max(0, Math.min(index, length - 1))
}

export function GradingEvidenceView({
  resetKey,
  linkageEnabled,
  onLinkageEnabledChange,
  questions,
  activeQuestionId,
  onActiveQuestionIdChange,
  pages,
  evidenceByQuestionId,
}: {
  resetKey: string
  linkageEnabled: boolean
  onLinkageEnabledChange: (v: boolean) => void
  questions: EvidenceQuestion[]
  activeQuestionId: string | null
  onActiveQuestionIdChange: (id: string) => void
  pages: EvidencePage[]
  evidenceByQuestionId: EvidenceByQuestionId
}) {
  const [selectedPageIndex, setSelectedPageIndex] = React.useState(0)
  const [rotate, setRotate] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  React.useEffect(() => {
    setSelectedPageIndex(0)
    setRotate(0)
    setLightboxOpen(false)
  }, [resetKey])

  React.useEffect(() => {
    if (!linkageEnabled) return
    if (!activeQuestionId) return
    const v = evidenceByQuestionId[activeQuestionId]
    if (!v) return

    // 低成本路线：只做“按页联动”，避免依赖题目级裁切与精准框选。
    setSelectedPageIndex(clampIndex(v.pageIndex, pages.length))
  }, [
    activeQuestionId,
    evidenceByQuestionId,
    linkageEnabled,
    pages.length,
  ])

  const preview = React.useMemo(() => {
    const page = pages[clampIndex(selectedPageIndex, pages.length)]
    if (!page) return null
    return { label: page.label, src: page.src, boxes: [] as EvidenceBox[] }
  }, [pages, selectedPageIndex])

  return (
    <div className="rounded-2xl border-2 border-black bg-white/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black">证据视图（原型）</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            当前为低成本方案：仅支持整份作业按页浏览；联动开启时按题自动跳页。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-muted-foreground">联动定位</div>
          <Switch checked={linkageEnabled} onCheckedChange={onLinkageEnabledChange} />
        </div>
      </div>

      <div className="mt-3 grid gap-3">
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
              onClick={() => setRotate((v) => (v + 90) % 360)}
              aria-label="旋转"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        <div className="rounded-xl border-2 border-black bg-white">
          {preview ? (
            <div className="grid gap-2 p-2">
              <div className="relative max-h-[calc(100svh-320px)] w-full overflow-y-scroll overflow-x-auto rounded-lg border border-black/20 bg-white">
                <button
                  type="button"
                  className="block w-full"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="点击预览大图"
                  title="点击预览大图"
                >
                  <div className="flex w-full justify-center">
                    <img
                      src={preview.src}
                      alt={preview.label}
                      className="block h-auto w-full cursor-zoom-in select-none"
                      style={{
                        transform: `rotate(${rotate}deg)`,
                        transformOrigin: 'center',
                      }}
                      draggable={false}
                    />
                  </div>
                </button>
              </div>

	              {linkageEnabled ? (
	                <div className="text-xs text-muted-foreground">
                  联动已开启：切换题目会自动跳到对应页（预览区可滚动）。
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  联动已关闭：老师可手动选页进行核对（预览区可滚动）。
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              暂无可预览的证据（原型）。请选择题目/页面。
            </div>
          )}
        </div>
      </div>

      <DialogPrimitive.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <DialogPrimitive.Content
            className={cn(
              // 让 Content 只包裹图片区域，避免覆盖整个屏幕导致“点空白处无法关闭”（点到了 Content 而不是 Overlay）
              'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none',
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              {preview ? `证据图片预览：${preview.label}` : '证据图片预览'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              弹窗内展示证据图片大图预览，可按 Esc 或点击遮罩关闭。
            </DialogPrimitive.Description>
            <div className="relative max-h-[92svh] max-w-[96vw] p-2">
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="absolute -right-3 -top-3 rounded-full border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="关闭预览"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
              {preview && (
                <div
                  className="relative origin-center"
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  <img
                    src={preview.src}
                    alt={preview.label}
                    className="max-h-[92svh] max-w-[96vw] select-none object-contain"
                    draggable={false}
                  />
                </div>
              )}
              {preview && (
                <div className="mt-2 text-center text-xs font-bold text-white/90">
                  {preview.label}（点击空白处或按 Esc 关闭）
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
