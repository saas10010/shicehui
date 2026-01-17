# 班级详情页一键进入班级看板

## 需求
- 教师可能管理多个班级；在班级详情（学生/二维码/作业批次等）中需要一键进入该班的看板（FR9）。

## 实现
- `app/(dashboard)/classes/[classId]/layout.tsx`：在班级头部信息区右侧新增按钮“进入班级看板”，跳转到 `/data?classId=${classId}`。
- 这样无论在班级的哪个子页（students/qrcodes/batches）都可直接进入该班的看板页面。