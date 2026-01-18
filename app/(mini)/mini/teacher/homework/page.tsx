import Link from 'next/link'

import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'
import { getBatches, getBatchesByClassId, getClassById, getClasses } from '@/lib/mock/queries'

function safePickFirst(value: string | string[] | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value[0] ?? '' : value
}

function toneOfStatus(status: 'processing' | 'ready' | 'needs_attention') {
  if (status === 'needs_attention') return 'warning'
  if (status === 'ready') return 'success'
  return 'default'
}

function statusLabel(status: 'processing' | 'ready' | 'needs_attention') {
  if (status === 'ready') return '已完成'
  if (status === 'needs_attention') return '待处理'
  return '处理中'
}

export default async function TeacherMiniHomeworkPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = (await searchParams) ?? {}
  const classIdFromQuery = safePickFirst(sp.classId)

  const classes = getClasses()
  const selectedClassId = classes.some((c) => c.id === classIdFromQuery) ? classIdFromQuery : ''
  const selectedClass = selectedClassId ? getClassById(selectedClassId) : null

  const batches = (selectedClassId ? getBatchesByClassId(selectedClassId) : getBatches())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-black">作业</div>
            <div className="mt-1 text-xs text-black/50">
              聚合查看各班级作业批次进度与异常；点击进入批次详情处理与确认（原型）。
            </div>
          </div>
          <WechatTag tone="default">{selectedClass?.name ?? '全部班级'}</WechatTag>
        </div>

        <div className="mt-3">
          <Link href="/mini/teacher/classes" className="text-sm text-[#07c160]">
            ← 返回班级
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="筛选：全部班级"
          description="显示全部班级的作业批次"
          href="/mini/teacher/homework"
          right={<WechatTag tone={selectedClassId ? 'default' : 'success'}>{selectedClassId ? '可选' : '当前'}</WechatTag>}
        />
        <WechatDivider />
        {classes.map((c, idx) => (
          <div key={c.id}>
            <WechatCell
              title={`筛选：${c.name}`}
              description={`${c.grade} · ${c.subject}`}
              href={`/mini/teacher/homework?classId=${encodeURIComponent(c.id)}`}
              right={<WechatTag tone={selectedClassId === c.id ? 'success' : 'default'}>{selectedClassId === c.id ? '当前' : '可选'}</WechatTag>}
            />
            {idx === classes.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
      </WechatCard>

      <WechatCard>
        {batches.map((b, idx) => {
          const classInfo = getClassById(b.classId)
          return (
            <div key={b.id}>
              <WechatCell
                title={b.title}
                description={`${classInfo?.name ?? '未知班级'} · ${b.createdAt} · ${b.source} · 异常 ${b.exceptionImages}`}
                right={<WechatTag tone={toneOfStatus(b.status)}>{statusLabel(b.status)}</WechatTag>}
                href={`/mini/teacher/classes/${encodeURIComponent(b.classId)}/batches/${encodeURIComponent(b.id)}`}
              />
              {idx === batches.length - 1 ? null : <WechatDivider />}
            </div>
          )
        })}
        {!batches.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无作业批次
          </div>
        ) : null}
      </WechatCard>

    </div>
  )
}
