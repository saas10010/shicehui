import * as React from 'react'
import { BrutalBackground, BrutalFrame } from '@/components/brutal/brutal-frame'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrutalBackground>
      <BrutalFrame>
        <div className="border-b-4 border-black p-4 sm:p-6 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                师策汇
              </div>
              <div className="text-sm text-muted-foreground">
                批改即建档｜教师端原型
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </BrutalFrame>
    </BrutalBackground>
  )
}

