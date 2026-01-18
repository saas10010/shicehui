'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function SettingsPanel() {
  const [autoArchive, setAutoArchive] = React.useState(true)
  const [showEvidence, setShowEvidence] = React.useState(true)

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <h1 className="text-2xl font-black">设置</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          原型：用于演示偏好开关与安全提示（非完整权限体系）。
        </p>
      </BrutalCard>

      <BrutalCard className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-black">自动归档</div>
            <div className="text-sm text-muted-foreground">
              上传后自动识别姓名/学号并归档到学生（FR4）。
            </div>
          </div>
          <Switch checked={autoArchive} onCheckedChange={setAutoArchive} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-black">证据视图</div>
            <div className="text-sm text-muted-foreground">
              批改确认中展示图片证据与可追溯信息（可用性目标：可信与可控）。
            </div>
          </div>
          <Switch checked={showEvidence} onCheckedChange={setShowEvidence} />
        </div>

        <Button
          className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          onClick={() => toast.success('已保存设置（原型未持久化）')}
        >
          保存
        </Button>
      </BrutalCard>
    </div>
  )
}
