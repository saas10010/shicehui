# 原型迁移｜从“二维码绑码”改为“识别姓名/学号归档”（2026-01-18）

## 需求背景
- 不再使用学生二维码/绑码。
- 拍照采集时作业本会写明姓名与学号，AI 识别后将数据落位到对应学生。

## 核心改动
- 数据模型：
  - `lib/mock/types.ts` 移除 `Student.qrCodeValue`。
  - `lib/mock/data.ts` 学生 mock 数据移除二维码字段。
- 学生相关页面：
  - `components/mini/teacher/student-list-panel.tsx`：移除“已绑码”标签与二维码展示；搜索仅按姓名/学号。
  - `app/(mini)/mini/teacher/students/[studentId]/page.tsx`、`app/(dashboard)/students/[studentId]/page.tsx`：档案信息改为展示学号。
  - `components/students/student-list.tsx`、`app/(dashboard)/classes/[classId]/students/page.tsx`：移除二维码语义，补充“识别姓名/学号归档”文案。
- 采集/设置/异常语义：
  - `components/mini/teacher/capture-panel.tsx`、`components/settings/settings-panel.tsx`、`components/mini/teacher/settings-panel.tsx`：将“识别二维码”改为“识别姓名/学号”。
  - `lib/mock/types.ts`、`lib/mock/data.ts`：异常原因从“缺码/码损坏”调整为“姓名学号缺失/字迹不清”。
- 下线二维码相关页面与接口（保留路由但不可用）：
  - `app/(mini)/mini/teacher/classes/[classId]/qrcodes/page.tsx`、`app/(dashboard)/classes/[classId]/qrcodes/page.tsx`：直接 `notFound()`。
  - `app/api/qrcodes/a4/route.ts`、`app/api/qrcodes/single/route.ts`：返回 410（接口已下线）。
  - `components/classes/class-subnav.tsx`：移除“二维码”导航项。

## 验证
- `npm -s run build` 通过。