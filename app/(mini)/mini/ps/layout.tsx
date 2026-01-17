'use client'

import * as React from 'react'
import { PS_TABS } from '@/components/mini/ps/ps-tabs'
import { WechatPage } from '@/components/mini/wechat-shell'

export default function PsMiniLayout({ children }: { children: React.ReactNode }) {
  return (
    <WechatPage title="师策汇" tabs={PS_TABS}>
      {children}
    </WechatPage>
  )
}

