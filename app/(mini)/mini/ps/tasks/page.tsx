import { safeRole } from '@/lib/mini/ps'
import { redirect } from 'next/navigation'

export default async function PsTasksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  redirect(`/mini/ps/materials?role=${role}`)
}
