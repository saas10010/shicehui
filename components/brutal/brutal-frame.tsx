import * as React from 'react'
import { cn } from '@/lib/utils'

export function BrutalBackground({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'min-h-svh bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function BrutalFrame({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'w-full max-w-screen-2xl mx-auto backdrop-blur-xl bg-white/40 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
