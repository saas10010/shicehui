import * as React from 'react'
import Link from 'next/link'

import { BrutalBackground, BrutalFrame } from '@/components/brutal/brutal-frame'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BrutalBackground>
      <BrutalFrame>
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <MobileNav />
              </div>
              <Link href="/classes" className="block">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  师策汇
                </div>
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                asChild
              >
                <Link href="/materials">生成资料</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-[280px_1fr]">
          <aside className="hidden md:block border-r-4 border-black bg-white/40 p-4">
            <SidebarNav />
          </aside>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </BrutalFrame>
    </BrutalBackground>
  )
}
