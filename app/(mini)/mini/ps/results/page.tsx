import { ResultsList } from '@/components/mini/ps/results-list'
import { safeRole } from '@/lib/mini/ps'

export default function PsResultsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <ResultsList role={role} />
}

