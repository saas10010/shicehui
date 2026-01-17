import { ReinforceCenter, type ReinforceTab } from '@/components/reinforce/reinforce-center'

export const dynamic = 'force-dynamic'

function normalizeTab(value: unknown): ReinforceTab {
  return value === 'tasks' ? 'tasks' : 'materials'
}

export default async function ReinforcePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const tab = normalizeTab(resolvedSearchParams.tab)
  const studentId =
    typeof resolvedSearchParams.studentId === 'string'
      ? resolvedSearchParams.studentId
      : undefined

  return <ReinforceCenter defaultTab={tab} defaultStudentId={studentId} />
}

