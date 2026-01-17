import { ResultDetail } from '@/components/mini/ps/result-detail'
import { safeRole } from '@/lib/mini/ps'

export default function PsResultDetailPage({
  params,
  searchParams,
}: {
  params: { resultId: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <ResultDetail role={role} resultId={params.resultId} />
}

