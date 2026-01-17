'use client'

import * as React from 'react'
import { TEACHER_TABS } from '@/components/mini/teacher/teacher-tabs'
import { WechatPage } from '@/components/mini/wechat-shell'

export default function TeacherMiniLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WechatPage title="师策汇（教师端）" tabs={TEACHER_TABS}>
      {children}
    </WechatPage>
  )
}

