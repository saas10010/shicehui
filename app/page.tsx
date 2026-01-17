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
                一个页面展示两个入口：教师端 Web + 小程序原型（微信风格）
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
          <div className="grid gap-4 md:grid-cols-2">
            <BrutalCard className="p-6">
              <div className="text-xl font-black">教师端入口（PC Web）</div>
              <div className="mt-2 text-sm text-muted-foreground">
                对应 PRD/UX 的教师端主流程：建班 → 二维码 → 批次 → 异常 → 批改确认 →
                看板/档案 → 资料生成。
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  asChild
                >
                  <Link href="/classes">进入教师端</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-black font-bold"
                  asChild
                >
                  <Link href="/login">去登录</Link>
                </Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                说明：未登录访问教师端会自动跳转到登录页（原型路由保护）。
              </div>
            </BrutalCard>

            <BrutalCard className="p-6">
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
        </div>
      </BrutalFrame>
    </BrutalBackground>
  )
}
