export type MiniQueueStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'failed'

export type MiniQueueItem = {
  id: string
  createdAt: string
  status: MiniQueueStatus
  progress: number
  errorMessage?: string
}

export const MINI_QUEUE_STORAGE_KEY = 'shicehui:miniQueue'

export function nowLabel() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function safeParseQueue(raw: string | null): MiniQueueItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const candidate = item as Record<string, unknown>

        const id = candidate.id
        const createdAt = candidate.createdAt
        if (typeof id !== 'string' || typeof createdAt !== 'string') return null

        const statusRaw = candidate.status
        const status: MiniQueueStatus =
          statusRaw === 'pending' ||
          statusRaw === 'uploading' ||
          statusRaw === 'success' ||
          statusRaw === 'failed'
            ? statusRaw
            : 'pending'

        const progressRaw = candidate.progress
        const progressNumber =
          typeof progressRaw === 'number' && Number.isFinite(progressRaw)
            ? progressRaw
            : 0
        const progress = Math.max(0, Math.min(100, progressNumber))

        const errorMessageRaw = candidate.errorMessage
        const errorMessage =
          typeof errorMessageRaw === 'string' ? errorMessageRaw : undefined

        return {
          id,
          createdAt,
          status,
          progress,
          ...(errorMessage ? { errorMessage } : {}),
        } satisfies MiniQueueItem
      })
      .filter((i): i is MiniQueueItem => i !== null)
  } catch {
    return []
  }
}

export function shouldFail(id: string) {
  // 纯前端原型：用稳定规则模拟失败，避免完全随机导致演示不可控
  const last = id.slice(-2)
  const n = Number.parseInt(last, 16)
  return Number.isFinite(n) ? n % 7 === 0 : false
}
