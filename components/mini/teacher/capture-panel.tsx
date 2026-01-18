'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import {
  MINI_QUEUE_STORAGE_KEY,
  nowLabel,
  safeParseQueue,
  type MiniQueueItem,
} from '@/lib/mini/queue'

function saveQueue(items: MiniQueueItem[]) {
  localStorage.setItem(MINI_QUEUE_STORAGE_KEY, JSON.stringify(items))
}

export function CapturePanel() {
  const router = useRouter()
  const [offline, setOffline] = React.useState(false)
  const [count, setCount] = React.useState(0)
  const [preview, setPreview] = React.useState<MiniQueueItem[]>([])

  React.useEffect(() => {
    const items = safeParseQueue(localStorage.getItem(MINI_QUEUE_STORAGE_KEY))
    setCount(items.length)
    setPreview(items.slice(0, 3))
  }, [])

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-black">连拍采集</div>
            <div className="mt-1 text-xs text-black/50">
              取景框提示：作业本的姓名/学号需入镜；拍摄后进入上传队列。
            </div>
          </div>
          <WechatTag tone={offline ? 'warning' : 'success'}>
            {offline ? '离线暂存' : '在线'}
          </WechatTag>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90"
            onClick={() => {
              const id = `q-${Date.now().toString(16)}`
              const newItem: MiniQueueItem = {
                id,
                createdAt: nowLabel(),
                status: offline ? 'offline' : 'pending',
                progress: 0,
              }
              const items = safeParseQueue(
                localStorage.getItem(MINI_QUEUE_STORAGE_KEY),
              )
              const next = [newItem, ...items]
              saveQueue(next)
              setCount(next.length)
              setPreview(next.slice(0, 3))
            }}
          >
            拍摄一张（模拟）
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
            onClick={() => setOffline((v) => !v)}
          >
            {offline ? '切回在线' : '切到离线'}
          </button>
        </div>

        <div className="mt-3 text-xs text-black/50">
          已拍：{count} 张 · 弱网/断网时会提示“离线暂存中”，网络恢复后可续传。
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="上传队列"
          description="查看上传进度、失败原因与重试"
          right={<WechatTag tone="default">{count}</WechatTag>}
          onClick={() => router.push('/mini/teacher/queue')}
        />
        <WechatDivider />
        <WechatCell
          title="拍摄注意事项"
          description="尽量让姓名/学号清晰入镜；缺失/冲突会进入异常池"
          right={<WechatTag tone="default">提示</WechatTag>}
        />
      </WechatCard>

      <WechatCard>
        <div className="px-4 py-3">
          <div className="text-sm font-medium text-black">最近拍摄（预览）</div>
          <div className="mt-2 space-y-2">
            {preview.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f7f7] px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs text-black/70">
                    {p.createdAt}
                  </div>
                  <div className="truncate text-xs text-black/50">{p.id}</div>
                </div>
                <WechatTag
                  tone={
                    p.status === 'offline'
                      ? 'warning'
                      : p.status === 'pending'
                        ? 'default'
                        : 'success'
                  }
                >
                  {p.status === 'offline'
                    ? '离线'
                    : p.status === 'pending'
                      ? '待上传'
                      : p.status}
                </WechatTag>
              </div>
            ))}
            {!preview.length ? (
              <div className="text-xs text-black/50">暂无</div>
            ) : null}
          </div>
        </div>
      </WechatCard>
    </div>
  )
}
