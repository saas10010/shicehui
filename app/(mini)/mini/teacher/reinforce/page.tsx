import { MiniReinforcePanel } from '@/components/mini/teacher/reinforce-panel'

function safePickFirst(value: string | string[] | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value[0] ?? '' : value
}

export default async function TeacherMiniReinforcePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const tab = safePickFirst(sp.tab)
  const studentId = safePickFirst(sp.studentId)
  return (
    <MiniReinforcePanel
      defaultTab={tab === 'tasks' ? 'tasks' : 'materials'}
      defaultStudentId={studentId || undefined}
    />
  )
}

