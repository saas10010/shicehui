import { ResultsList } from '@/components/mini/ps/results-list'
import { safeRole } from '@/lib/mini/ps'

export default async function PsResultsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <ResultsList role={role} />
}
