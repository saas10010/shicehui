'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PRIMARY_NAV, type NavItem } from '@/components/dashboard/nav-items'

function isActive(pathname: string, href: string) {
  if (href === '/classes') {
    return pathname === '/classes' || pathname.startsWith('/classes/')
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav({
  items = PRIMARY_NAV,
  onNavigate,
}: {
  items?: NavItem[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-base font-bold transition-colors',
              active
                ? 'bg-black text-white'
                : 'hover:bg-black/10 text-foreground',
            )}
          >
            <item.Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}

      <div className="pt-4">
        <form action="/logout" method="post">
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start rounded-xl border-2 border-black font-bold"
            onClick={() => onNavigate?.()}
          >
            退出登录
          </Button>
        </form>
      </div>
    </nav>
  )
}

