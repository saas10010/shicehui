import { MiniMe } from '@/components/mini/ps/me'
import { safeRole } from '@/lib/mini/ps'

export default function PsMePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const role = safeRole(searchParams.role)
  return <MiniMe role={role} />
}

