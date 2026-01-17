import Link from 'next/link'

import { getBatchesByClassId, getClasses } from '@/lib/mock/queries'
import { WechatCard, WechatCell, WechatDivider, WechatTag } from '@/components/mini/wechat-shell'

export default function TeacherBatchesEntryPage() {
  const classes = getClasses()
  const classInfo = classes[0]
  const batches = classInfo ? getBatchesByClassId(classInfo.id) : []

  return (
    <div className="space-y-4">
      <WechatCard className="p-4">
        <div className="text-sm font-medium text-black">批次入口（Web 优先）</div>
        <div className="mt-1 text-xs text-black/50">
          小程序端侧重“采集与队列”；批次详情与异常处理优先跳转 Web。
        </div>
        <div className="mt-3">
          <Link href="/classes" className="text-sm text-[#07c160]">
            打开教师端 Web →
          </Link>
        </div>
      </WechatCard>

      <WechatCard>
        <WechatCell
          title="当前班级（示例）"
          description={classInfo ? `${classInfo.name} · ${classInfo.subject}` : '暂无'}
          right={<WechatTag tone="default">示例</WechatTag>}
        />
        <WechatDivider />
        {batches.map((b, idx) => (
          <div key={b.id}>
            <WechatCell
              title={b.title}
              description={`${b.createdAt} · 异常 ${b.exceptionImages} · 已处理 ${b.processedImages}/${b.totalImages}`}
              right={<WechatTag tone={b.exceptionImages > 0 ? 'warning' : 'success'}>{b.exceptionImages > 0 ? '有异常' : '正常'}</WechatTag>}
              href={`/classes/${b.classId}/batches/${b.id}`}
            />
            {idx === batches.length - 1 ? null : <WechatDivider />}
          </div>
        ))}
        {!batches.length ? (
          <div className="px-4 py-10 text-center text-sm text-black/50">
            暂无批次数据
          </div>
        ) : null}
      </WechatCard>

      <WechatCard className="p-4">
        <div className="text-xs text-black/50">
          原型说明：真实产品可在小程序内展示“处理状态回流”，并提供一键跳转到对应批次（Web）。
        </div>
      </WechatCard>
    </div>
  )
}
