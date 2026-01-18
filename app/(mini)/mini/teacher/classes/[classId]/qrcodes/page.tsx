import { notFound } from 'next/navigation'

export default async function TeacherClassQRCodesPage({
  params: _params,
}: {
  params: Promise<{ classId: string }>
}) {
  notFound()
}
