# Change: 修复水印编辑器多项 Bug 并增强功能

## Why
当前水印编辑器存在多个用户体验问题：图片预览不清晰、白色颜色选择器不可见、单个模式缺乏多水印支持、批量模式缺乏长宽比校验、导出信息不完整。这些问题影响了工具的可用性和专业性。

## What Changes
1. **图片预览清晰度** - 修复 Canvas 在高 DPI 屏幕（如 Retina）上的模糊问题，使用 `devicePixelRatio` 进行缩放渲染
2. **颜色选择器优化** - 白色预设增加边框显示，添加推荐默认配置，增加重置配置按钮
3. **单个模式多水印** - 支持通过"添加"按钮添加多个水印，每个水印有可视边框、可拖拽移动、可删除
4. **批量模式长宽比校验** - 上传时检测图片长宽比，1%容差内视为一致，超出时警告但允许上传
5. **批量模式预览优化** - 通过第一张图片调整水印效果，自动应用到所有图片（移除九宫格位置选择器）
6. **导出信息增强** - 显示导出后的尺寸（宽×高）和预估文件大小

## Impact
- Affected specs: `watermark-editor`
- Affected code:
  - `src/components/Canvas/ImageCanvas.tsx` - 高 DPI 渲染修复、多水印支持、批量模式预览
  - `src/components/Toolbar/ColorPicker.tsx` - 颜色选择器边框、重置按钮
  - `src/components/Toolbar/Toolbar.tsx` - 重置配置按钮
  - `src/components/Canvas/ImageCanvas.tsx` - 多水印支持、批量模式预览
  - `src/components/Export/ExportButton.tsx` - 导出信息显示
  - `src/types/watermark.ts` - 多水印数据结构
  - `src/utils/watermark.ts` - 多水印渲染逻辑

