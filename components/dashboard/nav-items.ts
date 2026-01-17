import {
  BarChart3,
  BookOpenCheck,
  Boxes,
  Files,
  Settings,
  ClipboardList,
} from 'lucide-react'
import type React from 'react'

export type NavItem = {
  label: string
  href: string
  Icon: React.ComponentType<{ className?: string }>
}

export const PRIMARY_NAV: NavItem[] = [
  { label: '班级', href: '/classes', Icon: Boxes },
  { label: '作业', href: '/classes', Icon: ClipboardList },
  { label: '数据', href: '/data', Icon: BarChart3 },
  { label: '资料', href: '/materials', Icon: Files },
  { label: '练习任务', href: '/tasks', Icon: BookOpenCheck },
  { label: '设置', href: '/settings', Icon: Settings },
]
