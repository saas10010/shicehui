import { MiniTasks } from '@/components/mini/ps/tasks'
import { safeRole } from '@/lib/mini/ps'

export default function PsTasksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <MiniTasks role={role} />
}

