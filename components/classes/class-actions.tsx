'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Upload, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ClassActions() {
  const [openCreate, setOpenCreate] = React.useState(false)
  const [openImport, setOpenImport] = React.useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        onClick={() => setOpenCreate(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        创建班级
      </Button>
      <Button
        variant="outline"
        className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        onClick={() => setOpenImport(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        导入学生
      </Button>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-black">创建班级（原型）</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('已创建班级（原型未持久化）')
              setOpenCreate(false)
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="className">班级名称</Label>
              <Input id="className" placeholder="例如：七年级1班" className="border-2 border-black rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">学科（可选）</Label>
              <Input id="subject" placeholder="例如：数学" className="border-2 border-black rounded-xl" />
            </div>
            <Button className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              确认创建
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openImport} onOpenChange={setOpenImport}>
        <DialogContent className="border-4 border-black">
          <DialogHeader>
            <DialogTitle className="font-black">导入学生名单（原型）</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              支持按模板导入：至少包含「姓名」「编号」。本原型仅演示交互与状态，不接入真实文件解析。
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-2 border-black font-bold"
              onClick={() => toast.message('已下载模板（原型占位）')}
            >
              下载导入模板
            </Button>
            <Button
              className="w-full rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => {
                toast.success('导入完成：成功 38 条，失败 2 条（原型模拟）')
                setOpenImport(false)
              }}
            >
              选择文件并导入
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

