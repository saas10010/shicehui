'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialsCenter } from '@/components/materials/materials-center'

export type ReinforceTab = 'materials'

export function ReinforceCenter({
  defaultTab = 'materials',
  defaultStudentId,
}: {
  defaultTab?: ReinforceTab
  defaultStudentId?: string
}) {
  const [tab, setTab] = React.useState<ReinforceTab>(defaultTab)
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const currentTab = searchParams.get('tab')
    if (currentTab === tab) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`/reinforce?${params.toString()}`, { scroll: false })
  }, [router, searchParams, tab])

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as ReinforceTab)}>
      <div className="space-y-4">
        <BrutalCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black">巩固中心</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                题单与册子用于讲评/打印；支持生成历史错题与错题变体（原型）。
              </p>
            </div>
            <TabsList className="border-2 border-black bg-white">
              <TabsTrigger value="materials" className="font-bold">
                题单与册子
              </TabsTrigger>
            </TabsList>
          </div>
        </BrutalCard>

        <TabsContent value="materials" className="mt-0">
          <MaterialsCenter defaultStudentId={defaultStudentId} embedded />
        </TabsContent>
      </div>
    </Tabs>
  )
}
