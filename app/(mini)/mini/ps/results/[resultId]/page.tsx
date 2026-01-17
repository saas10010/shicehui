import { ResultDetail } from '@/components/mini/ps/result-detail'
import { safeRole } from '@/lib/mini/ps'

export default async function PsResultDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ resultId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { resultId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <ResultDetail role={role} resultId={resultId} />
}
