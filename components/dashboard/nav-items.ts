import {
  BarChart3,
  Boxes,
  Settings,
  ClipboardList,
  Sparkles,
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
  { id: 'homework', label: '作业', href: '/homework', Icon: ClipboardList },
  { id: 'data', label: '数据', href: '/data', Icon: BarChart3 },
  { id: 'reinforce', label: '巩固中心', href: '/reinforce', Icon: Sparkles },
  { id: 'settings', label: '设置', href: '/settings', Icon: Settings },
]
