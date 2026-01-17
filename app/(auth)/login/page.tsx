import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function safeNextPathOrEmpty(raw: string) {
  const value = raw.trim()
  if (!value) return ''
  if (!value.startsWith('/')) return ''
  if (value.startsWith('//')) return ''
  return value
}

async function loginAction(formData: FormData) {
  'use server'

  const phone = String(formData.get('phone') ?? '').trim()
  const nextPath = String(formData.get('next') ?? '').trim()
  if (!phone) return

  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, '1', {
    path: '/',
    sameSite: 'lax',
  })

  const safeNext = safeNextPathOrEmpty(nextPath) || '/classes'
  redirect(safeNext)
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const nextRaw =
    typeof resolvedSearchParams.next === 'string'
      ? resolvedSearchParams.next
      : ''
  const nextPath = safeNextPathOrEmpty(nextRaw)
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border-4 border-black bg-white/70 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6">
          <h1 className="text-2xl font-black">教师登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            原型演示：输入任意手机号即可进入系统。
          </p>
        </div>

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="例如：13800000000"
              className="border-2 border-black rounded-xl"
              inputMode="numeric"
              autoComplete="tel"
              required
            />
          </div>

          <Button className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            登录
          </Button>
        </form>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        说明：本原型不接入真实账号体系，仅用于演示 PRD/UX/UI 的关键流程与状态。
      </div>
    </div>
  )
}
