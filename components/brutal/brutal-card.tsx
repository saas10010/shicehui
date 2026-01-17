'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function BrutalCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-2xl border-4 border-black bg-white/70 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        className,
      )}
      {...props}
    />
  )
}
