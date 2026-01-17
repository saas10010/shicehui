import { redirect } from 'next/navigation'

export default function ClassIndexPage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  redirect(`/classes/${classId}/students`)
}
