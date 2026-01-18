import { safeRole } from '@/lib/mini/ps'
import { redirect } from 'next/navigation'

export default async function PsTaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  redirect(`/mini/ps/materials?role=${role}`)
}
