import { MaterialsCenter } from '@/components/materials/materials-center'

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
  return <MaterialsCenter defaultStudentId={studentId} />
}
