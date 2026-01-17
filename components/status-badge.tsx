import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StatusBadge({
  status,
  className,
}: {
  status:
    | '待上传'
    | '上传中'
    | '处理中'
    | '待处理'
    | '已完成'
    | '失败'
    | '可确认'
    | '需处理'
    | '生成中'
    | '进行中'
  className?: string
}) {
  const variant =
    status === '失败' || status === '需处理'
      ? 'destructive'
    : status === '已完成' || status === '可确认'
        ? 'default'
        : status === '待处理' || status === '生成中' || status === '进行中'
          ? 'secondary'
          : 'outline'

  return (
    <Badge
      variant={variant}
      className={cn('border-2 border-black font-bold', className)}
    >
      {status}
    </Badge>
  )
}
