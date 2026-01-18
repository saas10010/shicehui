import { notFound } from 'next/navigation'

export default async function ClassQRCodesPage({
  params: _params,
}: {
  params: Promise<{ classId: string }>
}) {
  notFound()
}
