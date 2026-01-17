import { redirect } from 'next/navigation'

export default async function ClassIndexPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  redirect(`/classes/${classId}/students`)
}
