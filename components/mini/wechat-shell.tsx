'use client'

import * as React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type WechatTab = {
  key: string
  label: string
  href: string
}

export function WechatPage({
  title,
  children,
  tabs,
}: {
  title: string
  children: React.ReactNode
  tabs?: WechatTab[]
}) {
  return (
    <div className="min-h-svh bg-[#f7f7f7]">
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="text-base font-semibold text-black">{title}</div>
        </div>
      </div>

      <div className={cn('mx-auto max-w-md px-4 py-4', tabs ? 'pb-24' : '')}>
        {children}
      </div>

      {tabs ? <WechatTabbar tabs={tabs} /> : null}
    </div>
  )
}

export function WechatCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-black/5 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function WechatCell({
  title,
  description,
  right,
  onClick,
  href,
}: {
  title: string
  description?: string
  right?: React.ReactNode
  onClick?: () => void
  href?: string
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-black">{title}</div>
        {description ? (
          <div className="mt-0.5 text-xs text-black/50">{description}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block active:bg-black/5">
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left active:bg-black/5"
    >
      {content}
    </button>
  )
}

export function WechatDivider() {
  return <div className="h-px bg-black/5" />
}

export function WechatTag({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const classes =
    tone === 'success'
      ? 'bg-green-50 text-green-700 border-green-200'
      : tone === 'warning'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
        : tone === 'danger'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs', classes)}>
      {children}
    </span>
  )
}

function WechatTabbar({ tabs }: { tabs: WechatTab[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const role = searchParams.get('role')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-md">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`)
          const href =
            role && !t.href.includes('?')
              ? `${t.href}?role=${encodeURIComponent(role)}`
              : t.href
          return (
            <Link
              key={t.key}
              href={href}
              className={cn(
                'flex-1 px-2 py-2 text-center text-xs',
                active ? 'text-[#07c160] font-semibold' : 'text-black/60',
              )}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
      <div className="h-3 bg-white" />
    </div>
  )
}
