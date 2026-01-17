import { MiniTaskDetail } from '@/components/mini/ps/tasks'
import { safeRole } from '@/lib/mini/ps'

export default async function PsTaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { taskId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <MiniTaskDetail role={role} taskId={taskId} />
}
