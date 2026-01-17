import { MaterialsCenter } from '@/components/materials/materials-center'

export const dynamic = 'force-dynamic'

export default function MaterialsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const studentId =
    typeof searchParams.studentId === 'string' ? searchParams.studentId : undefined
  return <MaterialsCenter defaultStudentId={studentId} />
}
