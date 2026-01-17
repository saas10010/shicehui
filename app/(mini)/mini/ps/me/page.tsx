import { MiniMe } from '@/components/mini/ps/me'
import { safeRole } from '@/lib/mini/ps'

export default async function PsMePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <MiniMe role={role} />
}
