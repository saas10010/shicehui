import { MiniMaterials } from '@/components/mini/ps/materials'
import { safeRole } from '@/lib/mini/ps'

export default async function PsMaterialsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const role = safeRole(resolvedSearchParams.role)
  return <MiniMaterials role={role} />
}
