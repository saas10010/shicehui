import { redirect } from 'next/navigation'

export default function TeacherBatchesEntryPage() {
  // 兼容旧路由：早期「班级」Tab 指向 `/mini/teacher/batches`。
  redirect('/mini/teacher/classes')
}
