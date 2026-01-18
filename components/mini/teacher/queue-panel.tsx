'use client'

import * as React from 'react'

import {
  MINI_QUEUE_STORAGE_KEY,
  safeParseQueue,
  shouldFail,
  type MiniQueueItem,
} from '@/lib/mini/queue'
import {
  WechatCard,
  WechatCell,
  WechatDivider,
  WechatTag,
} from '@/components/mini/wechat-shell'

function saveQueue(items: MiniQueueItem[]) {
  localStorage.setItem(MINI_QUEUE_STORAGE_KEY, JSON.stringify(items))
}

function labelOf(status: MiniQueueItem['status']) {
  if (status === 'pending') return '待上传'
  if (status === 'uploading') return '上传中'
  if (status === 'success') return '成功'
  return '失败'
}

function toneOf(status: MiniQueueItem['status']) {
  if (status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  return 'default'
}

export function QueuePanel() {
  const [items, setItems] = React.useState<MiniQueueItem[]>([])

  React.useEffect(() => {
    setItems(safeParseQueue(localStorage.getItem(MINI_QUEUE_STORAGE_KEY)))
  }, [])

  const update = (fn: (prev: MiniQueueItem[]) => MiniQueueItem[]) => {
    setItems((prev) => {
      const next = fn(prev)
      saveQueue(next)
      return next
    })
  }

  const simulateUpload = () => {
    update((prev) =>
      prev.map((i) => {
        if (i.status === 'pending') {
          return { ...i, status: 'uploading', progress: 0, errorMessage: undefined }
        }
        return i
      }),
    )

    window.setTimeout(() => {
      update((prev) =>
        prev.map((i) => {
          if (i.status !== 'uploading') return i
          if (shouldFail(i.id)) {
            return { ...i, status: 'failed', progress: 100, errorMessage: '网络波动，上传失败' }
          }
          return { ...i, status: 'success', progress: 100 }
        }),
      )
    }, 1200)
  }

  const retryFailed = () => {
    update((prev) =>
      prev.map((i) =>
        i.status === 'failed'
          ? { ...i, status: 'pending', progress: 0, errorMessage: undefined }
          : i,
      ),
    )
  }

  const clearSuccess = () => {
    update((prev) => prev.filter((i) => i.status !== 'success'))
  }

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">上传队列</div>
        <div className="mt-1 text-xs text-black/50">
          状态：待上传 / 上传中 / 成功 / 失败；失败可重试，成功可清理。
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90"
            onClick={simulateUpload}
            disabled={!items.some((i) => i.status === 'pending')}
          >
            开始上传（模拟）
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
            onClick={retryFailed}
            disabled={!items.some((i) => i.status === 'failed')}
          >
            重试失败项
          </button>
          <button
            type="button"
            className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black ring-1 ring-black/10 active:bg-black/5"
            onClick={clearSuccess}
            disabled={!items.some((i) => i.status === 'success')}
            style={{ gridColumn: '1 / -1' }}
          >
            清理成功项
          </button>
        </div>
      </WechatCard>

      <WechatCard>
        {items.map((i, idx) => (
          <React.Fragment key={i.id}>
            <WechatCell
              title={labelOf(i.status)}
              description={`${i.createdAt} · ${i.id}${i.errorMessage ? ` · ${i.errorMessage}` : ''}`}
              right={
                <WechatTag tone={toneOf(i.status)}>
                  {i.status === 'uploading' ? `${i.progress}%` : labelOf(i.status)}
                </WechatTag>
              }
            />
            {idx === items.length - 1 ? null : <WechatDivider />}
          </React.Fragment>
        ))}
        {!items.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无队列项
          </div>
        ) : null}
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：真实小程序需支持相机权限、后台上传、进度与失败原因区分（网络/权限/服务端）。
        </div>
      </WechatCard>
    </div>
  )
}
