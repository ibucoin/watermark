# Change: 重构水印编辑器 UI 架构

## Why
当前的左右分栏布局和三种模式切换增加了使用复杂度。需要简化为单一图片操作窗口，提供更直观的文本框交互方式，同时保留平铺水印作为可选配置。

## What Changes
- **BREAKING** 移除左侧固定工具栏，改为选中文本框时显示的浮动工具栏
- **BREAKING** 移除三种模式切换（平铺/单个/批量），统一为单一操作模式
- 新增可交互文本框控件：支持拖拽、调整大小、旋转
- 平铺水印改为可选配置项，与单个文本框不冲突
- 保留底部缩略图批量加载功能
- 图片显示改为适配容器大小（不内部缩放处理）

## Impact
- Affected specs: `watermark-editor`
- Affected code:
  - `src/components/WatermarkEditor.tsx` - 主组件重构
  - `src/components/Toolbar/` - 移除或重构为浮动工具栏
  - `src/components/Canvas/ImageCanvas.tsx` - 重构图片显示和水印交互
  - `src/types/watermark.ts` - 更新类型定义
  - `src/utils/watermark.ts` - 更新渲染逻辑

