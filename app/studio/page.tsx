"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'

export default function StudioPage() {
  return (
    <div>
      <h2 className="text-2xl font-black mb-6">快速入口 & 状态示例</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: '班级', desc: '班级/学生/批次', href: '/mini/teacher/classes' },
          { title: '作业', desc: '聚合查看批次进度与异常', href: '/mini/teacher/homework' },
          { title: '数据看板', desc: '题目/知识点排行（原型）', href: '/mini/teacher/data' },
          { title: '巩固中心', desc: '题单/册子 + 练习任务（原型）', href: '/mini/teacher/reinforce' },
          { title: '设置', desc: '偏好开关（原型）', href: '/mini/teacher/settings' },
        ].map((item) => (
          <Link href={item.href} key={item.href} className="block">
            <Card className="border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-[-4px] transition-transform h-full">
              <div className="p-4 sm:p-6 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-black mb-3">状态标签（示例）</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="上传中" />
          <StatusBadge status="处理中" />
          <StatusBadge status="待处理" />
          <StatusBadge status="可确认" />
          <StatusBadge status="生成中" />
          <StatusBadge status="已完成" />
          <StatusBadge status="失败" />
        </div>
      </div>
    </div>
  )
}
