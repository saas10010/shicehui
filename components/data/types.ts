export type DateRangePreset = '7d' | '30d' | 'all' | 'custom'

export type RankStudent = {
  id: string
  name: string
}

export type RankSample = {
  id: string
  studentName: string
  createdAt: string
  errorRate: number
  batchId: string
}

export type RankRow = {
  key: string
  title: string
  errorRate: number
  wrongCount: number
  students: RankStudent[]
  samples: RankSample[]
}

