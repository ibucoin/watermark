# Change: 构建图片水印编辑器页面

## Why
用户需要一个可视化的图片水印工具，支持三种水印模式（平铺、单个可拖拽、批量），并提供丰富的水印参数控制。当前项目仅有 Astro 初始模板，需要从零构建完整的水印编辑器 UI。

## What Changes
- **新增页面布局**: 左侧工具栏 + 右侧图片操作区域
- **新增 React 组件**: 引入 React 作为交互框架，配合 Astro Islands
- **新增水印参数控制**: 文字、颜色、透明度、大小、角度、间距
- **新增三种水印模式**:
  - 平铺模式：全屏重复水印
  - 单个模式：可拖拽定位的单个水印
  - 批量模式：多图上传 + 统一位置 + zip 打包下载
- **新增导出功能**: PNG/JPG 格式，支持质量控制
- **新增样式系统**: TailwindCSS + shadcn/ui 组件库

## Impact
- Affected specs: `watermark-editor` (新建)
- Affected code:
  - `src/pages/index.astro` - 主页面
  - `src/components/` - 新增 React 组件 + shadcn/ui 组件
  - `src/utils/` - 新增水印处理逻辑
  - `package.json` - 新增依赖 (@astrojs/react, @astrojs/tailwind, jszip, shadcn/ui 相关)
  - `astro.config.mjs` - 集成 React 和 Tailwind
  - `tailwind.config.mjs` - Tailwind 配置（shadcn 预设）
  - `components.json` - shadcn/ui 配置

