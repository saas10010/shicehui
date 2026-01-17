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
  id: string
  label: string
  href: string
  Icon: React.ComponentType<{ className?: string }>
}

export const PRIMARY_NAV: NavItem[] = [
  { id: 'classes', label: '班级', href: '/classes', Icon: Boxes },
  { id: 'homework', label: '作业', href: '/classes', Icon: ClipboardList },
  { id: 'data', label: '数据', href: '/data', Icon: BarChart3 },
  { id: 'materials', label: '资料', href: '/materials', Icon: Files },
  { id: 'tasks', label: '练习任务', href: '/tasks', Icon: BookOpenCheck },
  { id: 'settings', label: '设置', href: '/settings', Icon: Settings },
]
