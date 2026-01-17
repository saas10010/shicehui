import { MiniTasks } from '@/components/mini/ps/tasks'
import { safeRole } from '@/lib/mini/ps'

export default async function PsTasksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <MiniTasks role={role} />
}
