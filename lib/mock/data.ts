import type {
  Batch,
  BatchExceptionItem,
  BatchStudentItem,
  ClassInfo,
  Student,
  WrongQuestion,
} from '@/lib/mock/types'

export const CLASSES: ClassInfo[] = [
  {
    id: 'c-7-1',
    name: '七年级1班',
    grade: '七年级',
    subject: '数学',
    studentCount: 8,
    lastGradedAt: '2026-01-16 18:20',
  },
  {
    id: 'c-7-2',
    name: '七年级2班',
    grade: '七年级',
    subject: '数学',
    studentCount: 6,
    lastGradedAt: '2026-01-15 17:10',
  },
]

export const STUDENTS: Student[] = [
  { id: 's-001', classId: 'c-7-1', name: '张晨', code: '001', qrCodeValue: 'SC-7-1-001' },
  { id: 's-002', classId: 'c-7-1', name: '李悦', code: '002', qrCodeValue: 'SC-7-1-002' },
  { id: 's-003', classId: 'c-7-1', name: '王浩', code: '003', qrCodeValue: 'SC-7-1-003' },
  { id: 's-004', classId: 'c-7-1', name: '陈曦', code: '004', qrCodeValue: 'SC-7-1-004' },
  { id: 's-005', classId: 'c-7-1', name: '赵一', code: '005', qrCodeValue: 'SC-7-1-005' },
  { id: 's-006', classId: 'c-7-1', name: '周琪', code: '006', qrCodeValue: 'SC-7-1-006' },
  { id: 's-007', classId: 'c-7-1', name: '孙铭', code: '007', qrCodeValue: 'SC-7-1-007' },
  { id: 's-008', classId: 'c-7-1', name: '刘宁', code: '008', qrCodeValue: 'SC-7-1-008' },
  { id: 's-101', classId: 'c-7-2', name: '林可', code: '101', qrCodeValue: 'SC-7-2-101' },
  { id: 's-102', classId: 'c-7-2', name: '方宇', code: '102', qrCodeValue: 'SC-7-2-102' },
  { id: 's-103', classId: 'c-7-2', name: '许然', code: '103', qrCodeValue: 'SC-7-2-103' },
  { id: 's-104', classId: 'c-7-2', name: '郭欣', code: '104', qrCodeValue: 'SC-7-2-104' },
  { id: 's-105', classId: 'c-7-2', name: '蒋晨', code: '105', qrCodeValue: 'SC-7-2-105' },
  { id: 's-106', classId: 'c-7-2', name: '杜子', code: '106', qrCodeValue: 'SC-7-2-106' },
]

export const BATCHES: Batch[] = [
  {
    id: 'b-20260116-1',
    classId: 'c-7-1',
    title: '2026-01-16 作业批次（连拍）',
    createdAt: '2026-01-16 16:05',
    source: '连拍采集',
    totalImages: 42,
    processedImages: 38,
    exceptionImages: 4,
    status: 'needs_attention',
  },
  {
    id: 'b-20260115-1',
    classId: 'c-7-1',
    title: '2026-01-15 作业批次（连拍）',
    createdAt: '2026-01-15 16:10',
    source: '连拍采集',
    totalImages: 40,
    processedImages: 40,
    exceptionImages: 0,
    status: 'ready',
  },
]

export const BATCH_STUDENTS: BatchStudentItem[] = [
  {
    batchId: 'b-20260116-1',
    studentId: 's-001',
    studentName: '张晨',
    imageCount: 7,
    draftStatus: '处理中',
    exceptions: 0,
  },
  {
    batchId: 'b-20260116-1',
    studentId: 's-002',
    studentName: '李悦',
    imageCount: 8,
    draftStatus: '可确认',
    exceptions: 0,
  },
  {
    batchId: 'b-20260116-1',
    studentId: 's-003',
    studentName: '王浩',
    imageCount: 8,
    draftStatus: '可确认',
    exceptions: 0,
  },
  {
    batchId: 'b-20260116-1',
    studentId: 's-004',
    studentName: '陈曦',
    imageCount: 7,
    draftStatus: '需处理',
    exceptions: 1,
  },
  {
    batchId: 'b-20260116-1',
    studentId: 's-005',
    studentName: '赵一',
    imageCount: 8,
    draftStatus: '可确认',
    exceptions: 0,
  },
]

export const BATCH_EXCEPTIONS: BatchExceptionItem[] = [
  {
    id: 'e-001',
    batchId: 'b-20260116-1',
    thumbnail: '/placeholder.jpg',
    reason: '缺码',
    suggestedStudentIds: ['s-004', 's-005'],
  },
  {
    id: 'e-002',
    batchId: 'b-20260116-1',
    thumbnail: '/placeholder.jpg',
    reason: '识别冲突',
    suggestedStudentIds: ['s-003'],
  },
  {
    id: 'e-003',
    batchId: 'b-20260116-1',
    thumbnail: '/placeholder.jpg',
    reason: '码损坏',
    suggestedStudentIds: [],
  },
  {
    id: 'e-004',
    batchId: 'b-20260116-1',
    thumbnail: '/placeholder.jpg',
    reason: '缺码',
    suggestedStudentIds: ['s-001'],
  },
]

export const WRONG_QUESTIONS: WrongQuestion[] = [
  {
    id: 'wq-1',
    studentId: 's-002',
    batchId: 'b-20260115-1',
    title: '一元一次方程（移项）',
    knowledgePoint: '移项法则',
    errorRate: 0.42,
    createdAt: '2026-01-15 16:30',
  },
  {
    id: 'wq-2',
    studentId: 's-003',
    batchId: 'b-20260115-1',
    title: '整式加减（合并同类项）',
    knowledgePoint: '合并同类项',
    errorRate: 0.35,
    createdAt: '2026-01-15 16:31',
  },
  {
    id: 'wq-3',
    studentId: 's-004',
    batchId: 'b-20260116-1',
    title: '有理数运算（符号与括号）',
    knowledgePoint: '有理数运算',
    errorRate: 0.28,
    createdAt: '2026-01-16 16:40',
  },
  {
    id: 'wq-4',
    studentId: 's-005',
    batchId: 'b-20260116-1',
    title: '几何：平行线性质',
    knowledgePoint: '平行线性质',
    errorRate: 0.22,
    createdAt: '2026-01-16 16:42',
  },
]
