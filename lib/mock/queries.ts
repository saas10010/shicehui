import {
  BATCHES,
  BATCH_EXCEPTIONS,
  BATCH_STUDENTS,
  CLASSES,
  STUDENTS,
  WRONG_QUESTIONS,
} from '@/lib/mock/data'

export function getClasses() {
  return CLASSES
}

export function getClassById(classId: string) {
  return CLASSES.find((c) => c.id === classId) ?? null
}

export function getStudentsByClassId(classId: string) {
  return STUDENTS.filter((s) => s.classId === classId)
}

export function getStudentById(studentId: string) {
  return STUDENTS.find((s) => s.id === studentId) ?? null
}

export function getBatchesByClassId(classId: string) {
  return BATCHES.filter((b) => b.classId === classId)
}

export function getBatchById(batchId: string) {
  return BATCHES.find((b) => b.id === batchId) ?? null
}

export function getBatchStudentItems(batchId: string) {
  return BATCH_STUDENTS.filter((i) => i.batchId === batchId)
}

export function getBatchExceptions(batchId: string) {
  return BATCH_EXCEPTIONS.filter((e) => e.batchId === batchId)
}

export function getWrongQuestionsByStudent(studentId: string) {
  return WRONG_QUESTIONS.filter((q) => q.studentId === studentId)
}

export function getWrongQuestionsByClass(classId: string) {
  const students = getStudentsByClassId(classId)
  const studentIds = new Set(students.map((s) => s.id))
  return WRONG_QUESTIONS.filter((q) => studentIds.has(q.studentId))
}

