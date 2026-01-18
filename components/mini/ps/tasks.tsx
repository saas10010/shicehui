'use client'

import * as React from 'react'
import Link from 'next/link'

import type { MiniRole } from '@/lib/mini/ps'
import { roleLabel } from '@/lib/mini/ps'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

type MiniTask = {
  id: string
  title: string
  status: '待完成' | '已提交'
}

const STORAGE_KEY = 'shicehui:miniPsTasks'

function loadTasks(): MiniTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MiniTask[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveTasks(tasks: MiniTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function seed(): MiniTask[] {
  return [
    { id: 't-1', title: '巩固练习：合并同类项', status: '待完成' },
    { id: 't-2', title: '巩固练习：移项法则', status: '已提交' },
  ]
}

export function MiniTasks({ role }: { role: MiniRole }) {
  const [tasks, setTasks] = React.useState<MiniTask[]>([])

  React.useEffect(() => {
    const existing = loadTasks()
    if (existing.length) {
      setTasks(existing)
      return
    }
    const initial = seed()
    saveTasks(initial)
    setTasks(initial)
  }, [])

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">练习任务</div>
            <div className="mt-1 text-xs text-black/50">
              当前角色：{roleLabel(role)}。学生端：领取 → 作答 → 提交；家长端：监督与查看。
            </div>
          </div>
          <WechatTag tone="default">原型</WechatTag>
        </div>
      </WechatCard>

      <WechatCard>
        {tasks.map((t, idx) => (
          <div key={t.id}>
            <WechatCell
              title={t.title}
              description={`状态：${t.status}`}
              right={
                <WechatTag tone={t.status === '待完成' ? 'warning' : 'success'}>
                  {t.status}
                </WechatTag>
              }
              href={`/mini/ps/tasks/${t.id}?role=${role}`}
            />
            {idx === tasks.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!tasks.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无任务
          </div>
        ) : null}
      </WechatCard>

      <div className="text-xs text-black/50">
        <Link href="/mini" className="text-[#07c160]">
          切换角色
        </Link>
      </div>
    </div>
  )
}

export function MiniTaskDetail({
  role,
  taskId,
}: {
  role: MiniRole
  taskId: string
}) {
  const [answer, setAnswer] = React.useState('')

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">作答页（原型）</div>
            <div className="mt-1 text-xs text-black/50">
              任务ID：{taskId} · 当前角色：{roleLabel(role)}
            </div>
          </div>
          <WechatTag tone="warning">待实现题目</WechatTag>
        </div>

        <div className="mt-3">
          <Link href={`/mini/ps/tasks?role=${role}`} className="text-sm text-[#07c160]">
            ← 返回任务列表
          </Link>
        </div>
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">作答内容</div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/10 bg-[#f7f7f7] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#07c160]/30"
          rows={6}
          placeholder="原型占位：输入任意内容模拟作答"
        />
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-[#07c160] px-4 py-3 text-center text-sm font-semibold text-white active:opacity-90"
          onClick={() => {
            const prev = loadTasks()
            const next = prev.map((t) =>
              t.id === taskId ? { ...t, status: '已提交' as const } : t,
            )
            saveTasks(next)
            window.history.back()
          }}
        >
          提交（模拟）
        </button>
        <div className="mt-2 text-xs text-black/50">
          原型说明：真实小程序应支持题型渲染、输入校验、提交状态与正确率反馈。
        </div>
      </WechatCard>
    </div>
  )
}
