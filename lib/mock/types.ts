export type Id = string

export type ClassInfo = {
  id: Id
  name: string
  grade: string
  subject: string
  studentCount: number
  lastGradedAt?: string
}

export type Student = {
  id: Id
  classId: Id
  name: string
  code: string
  qrCodeValue: string
}

export type BatchStatus = 'processing' | 'ready' | 'needs_attention'

export type Batch = {
  id: Id
  classId: Id
  title: string
  createdAt: string
  source: '连拍采集'
  totalImages: number
  processedImages: number
  exceptionImages: number
  status: BatchStatus
}

export type BatchStudentItem = {
  batchId: Id
  studentId: Id
  studentName: string
  imageCount: number
  draftStatus: '处理中' | '可确认' | '需处理'
  exceptions: number
}

export type BatchExceptionItem = {
  id: Id
  batchId: Id
  thumbnail: string
  reason: '缺码' | '识别冲突' | '码损坏'
  suggestedStudentIds: Id[]
}

export type WrongQuestion = {
  id: Id
  studentId: Id
  batchId: Id
  title: string
  knowledgePoint: string
  errorRate: number
  createdAt: string
}

export type PdfJobType = '全班易错题单' | '个人练习册' | '个人复习册' | '个人练习册/复习册'

export type PdfJob = {
  id: Id
  type: PdfJobType
  targetLabel: string
  rangeLabel: string
  outline?: string[]
  status: '生成中' | '已完成' | '失败'
  createdAt: string
}
