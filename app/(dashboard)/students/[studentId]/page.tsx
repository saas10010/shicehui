import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BrutalCard } from '@/components/brutal/brutal-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import {
  getClassById,
  getStudentById,
  getWrongQuestionsByStudent,
} from '@/lib/mock/queries'

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const student = getStudentById(studentId)
  if (!student) notFound()

  const classInfo = getClassById(student.classId)
  const wrongQuestions = getWrongQuestionsByStudent(studentId)

  const weakPoints = Object.entries(
    wrongQuestions.reduce<Record<string, number>>((acc, q) => {
      acc[q.knowledgePoint] = (acc[q.knowledgePoint] ?? 0) + 1
      return acc
    }, {}),
  )
    .map(([knowledgePoint, count]) => ({ knowledgePoint, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-4">
      <BrutalCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              <Link href={`/classes/${student.classId}/students`} className="underline underline-offset-4">
                返回学生列表
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-black">
              {student.name} <span className="text-base text-muted-foreground">#{student.code}</span>
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {classInfo?.name ?? '—'} · 学号：{student.code}
            </div>
          </div>

          <Button
            asChild
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Link href={`/materials?studentId=${student.id}`}>生成个人资料</Link>
          </Button>
        </div>
      </BrutalCard>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full bg-white/60 border-2 border-black rounded-xl p-1">
          <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            时间轴
          </TabsTrigger>
          <TabsTrigger value="wrong" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            错题（{wrongQuestions.length}）
          </TabsTrigger>
          <TabsTrigger value="weak" className="rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold">
            薄弱点
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">时间轴（原型）</div>
            <div className="mt-2 text-sm text-muted-foreground">
              按批次/日期聚合展示批改与错题沉淀（FR10）。本原型用错题时间替代完整批次记录。
            </div>
            <div className="mt-4 space-y-3">
              {wrongQuestions.map((q) => (
                <div key={q.id} className="rounded-xl border-2 border-black bg-white/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{q.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {q.createdAt} · 知识点：{q.knowledgePoint}
                      </div>
                    </div>
                    <StatusBadge status="已完成" />
                  </div>
                </div>
              ))}
              {!wrongQuestions.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
                  暂无错题记录
                </div>
              )}
            </div>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="wrong">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">错题列表</div>
            <div className="mt-2 text-sm text-muted-foreground">
              错题记录包含题目、时间、批次、知识点标签等字段（FR8/FR10）。
            </div>
            <div className="mt-4 space-y-3">
              {wrongQuestions.map((q) => (
                <div key={q.id} className="rounded-xl border-2 border-black bg-white/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{q.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        知识点：{q.knowledgePoint} · 批次：{q.batchId} · {q.createdAt}
                      </div>
                    </div>
                    <StatusBadge status="已完成" />
                  </div>
                </div>
              ))}
              {!wrongQuestions.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold">
                  暂无错题
                </div>
              )}
            </div>
          </BrutalCard>
        </TabsContent>

        <TabsContent value="weak">
          <BrutalCard className="mt-4 p-5">
            <div className="text-lg font-black">薄弱点概览</div>
            <div className="mt-2 text-sm text-muted-foreground">
              按知识点聚合，至少支持按错误数量排序（FR10）。
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {weakPoints.map((w) => (
                <div key={w.knowledgePoint} className="rounded-xl border-2 border-black bg-white/70 p-4">
                  <div className="text-base font-black">{w.knowledgePoint}</div>
                  <div className="mt-2 text-sm text-muted-foreground">错误次数：{w.count}</div>
                </div>
              ))}
              {!weakPoints.length && (
                <div className="rounded-xl border-2 border-black bg-white/70 p-6 text-center text-sm font-bold sm:col-span-2">
                  暂无薄弱点数据
                </div>
              )}
            </div>
          </BrutalCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
