import { MiniDataDashboardPanel } from '@/components/mini/teacher/data-dashboard-panel'

function safePickFirst(value: string | string[] | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value[0] ?? '' : value
}

export default async function TeacherMiniDataPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const classId = safePickFirst(sp.classId)
  return <MiniDataDashboardPanel defaultClassId={classId} />
}

