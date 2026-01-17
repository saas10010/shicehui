import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const studentId =
    typeof resolvedSearchParams.studentId === 'string'
      ? resolvedSearchParams.studentId
      : undefined

  const params = new URLSearchParams()
  params.set('tab', 'materials')
  if (studentId) params.set('studentId', studentId)

  redirect(`/reinforce?${params.toString()}`)
}
