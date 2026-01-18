import Link from 'next/link'

import { BrutalBackground, BrutalFrame } from '@/components/brutal/brutal-frame'
import { BrutalCard } from '@/components/brutal/brutal-card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <BrutalBackground>
      <BrutalFrame>
        <div className="border-b-4 border-black p-4 sm:p-6 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                师策汇
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                仅保留小程序端：用 Next.js 模拟微信小程序信息架构与关键交互
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              asChild
            >
              <Link href="/studio">原型实验室</Link>
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <BrutalCard className="p-6 max-w-xl">
            <div className="text-xl font-black">小程序原型入口（微信原生风格）</div>
            <div className="mt-2 text-sm text-muted-foreground">
              用 Next.js 模拟小程序页面与交互，支持角色切换：教师 / 家长 / 学生。
            </div>
            <div className="mt-4">
              <Button
                className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                asChild
              >
                <Link href="/mini">进入小程序原型</Link>
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              说明：此入口不依赖登录，用于演示移动端信息架构与关键状态（离线/上传/失败重试等）。
            </div>
          </BrutalCard>
        </div>
      </BrutalFrame>
    </BrutalBackground>
  )
}
