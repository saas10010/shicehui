import { MiniTaskDetail } from '@/components/mini/ps/tasks'
import { safeRole } from '@/lib/mini/ps'

export default function PsTaskDetailPage({
  params,
  searchParams,
}: {
  params: { taskId: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <MiniTaskDetail role={role} taskId={params.taskId} />
}

