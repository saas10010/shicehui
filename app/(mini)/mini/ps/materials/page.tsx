import { MiniMaterials } from '@/components/mini/ps/materials'
import { safeRole } from '@/lib/mini/ps'

export default function PsMaterialsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <MiniMaterials role={role} />
}

