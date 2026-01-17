# 批改确认页：证据视图双方案（整份作业/按题证据）

## 目标
- 在批改确认页将“题目/答案区域”与“证据视图”同屏展示。
- 教师可在原型中自行选择两种证据展示方案：
  - 「整份作业」：按页浏览整份作业图片，支持题目联动定位/高亮。
  - 「按题证据」：按题展示裁切证据（原型占位），减少翻页成本。
- 提供「联动定位」开关：
  - 开启：切换题目自动跳到对应页/证据；整份作业模式显示高亮框。
  - 关闭：完全手动选页/选证据。

## 实现
- 新增组件：`components/grading/grading-evidence-view.tsx`
  - UI：证据来源 ToggleGroup、题目 ToggleGroup、联动 Switch、缩放/旋转控制、缩略图列表、预览区与高亮框。
  - 内部状态：选页/选证据、缩放、旋转；基于 `resetKey` 在切换学生时重置。
- 接入页面：`components/grading/grading-confirm-panel.tsx`
  - 右侧改为两列布局：左「题目/答案区域」，右「证据视图」。
  - 在每题卡片增加「查看证据」按钮，并用 ring 标出当前题目。
  - 证据设置使用 `sessionStorage` 持久化（原型演示）：
    - key：`shicehui:grading-evidence-settings:${batchId}`
    - value：`{ sourceMode: '整份作业' | '按题证据', linkageEnabled: boolean }`
- 占位素材：新增 `public/evidence/*.svg`
  - page-1/2/3.svg：整页浏览占位
  - crop-q1/2/3.svg：按题证据占位

## 说明
- 题目→证据映射为原型固定映射（q1/q2/q3），真实系统应由上游识别/标注结果提供（页码、坐标框、多证据条目等）。
- `next build` 在无网络环境会因 `next/font` 拉取 Google Fonts 失败，与本功能改动无关。