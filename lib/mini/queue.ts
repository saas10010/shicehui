export type MiniQueueStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'failed'
  | 'offline'

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
    const parsed = JSON.parse(raw) as MiniQueueItem[]
    return Array.isArray(parsed) ? parsed : []
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

