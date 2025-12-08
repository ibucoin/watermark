# Project Context

## Purpose
这是一个为您定制的项目上下文（Project Context）草稿。

结合您作为独立开发者的身份（通常追求高效、低成本、易维护），以及带娃家庭的时间碎片化特点，我为您构建了一个以**Web前端技术（浏览器端处理）**为主的架构建议。这样可以避免复杂的后端维护，并利用浏览器算力直接处理图片，节省服务器成本。

您可以直接复制以下内容到您的 project_context.md 或 AI 编辑器（如 Cursor/Windsurf）的配置中。

Project Context: Image Watermark Tool
Purpose
开发一款高效、纯前端运行的图片水印工具，旨在帮助内容创作者和电商卖家快速保护图片版权。核心目标是实现"即开即用"和"隐私安全"（图片不上传服务器）。 主要解决三类场景：

全屏平铺水印：用于防止图片被盗用的高强度保护。

单个自由水印：用于精细化调整，支持拖拽移动位置。

批量固定水印：用于电商或自媒体多图统一处理（如统一右下角）。 并提供专业的导出功能（尺寸调整、PNG 格式、压缩控制）。

## Tech Stack
- **框架**: Astro 5.x (静态站点生成器，支持零 JS 打包)
- **语言**: TypeScript (严格模式)
- **包管理器**: Bun
- **图片处理**: Canvas API (浏览器原生)
- **样式**: TailwindCSS + shadcn/ui 组件库
- **交互框架**: React (配合 Astro Islands)

### 核心技术选型理由
- Astro: 纯静态部署，零服务器成本，SEO 友好
- Canvas API: 浏览器端图片处理，无需后端，保护用户隐私
- TypeScript: 类型安全，减少运行时错误

## Project Conventions

### Code Style
- 使用 TypeScript 严格模式
- 组件文件使用 PascalCase 命名 (如 `WatermarkEditor.astro`)
- 工具函数使用 camelCase 命名 (如 `applyWatermark.ts`)
- CSS 使用 Astro scoped styles，避免全局样式污染
- 优先使用 const，避免 let/var
- 使用中文注释说明业务逻辑

### Architecture Patterns
- **纯前端架构**: 所有图片处理在浏览器端完成
- **组件化**: Astro 组件负责 UI，独立 TS 模块负责业务逻辑
- **目录结构**:
  ```
  src/
  ├── components/    # Astro UI 组件
  ├── layouts/       # 页面布局
  ├── pages/         # 路由页面
  ├── utils/         # 工具函数 (图片处理、Canvas 操作等)
  └── assets/        # 静态资源
  ```

### Testing Strategy
- 暂不强制要求测试（除非用户主动要求）
- 核心图片处理函数应可独立测试

### Git Workflow
- 主分支: `main`
- 功能开发: 直接在 main 分支开发（个人项目简化流程）
- 提交信息: 使用中文，简洁描述变更内容

## Domain Context
### 水印类型
1. **全屏平铺水印**: 重复铺满整个图片，适合高强度版权保护
2. **单个自由水印**: 可拖拽定位，适合精细调整
3. **批量固定水印**: 固定位置（如右下角），适合批量处理

### 关键术语
- **水印透明度**: 0-100%，控制水印可见程度
- **水印间距**: 平铺模式下水印之间的距离
- **水印旋转**: 水印的倾斜角度（常用 -45°）

## Important Constraints
- **纯前端**: 不使用后端服务，所有处理在浏览器完成
- **隐私优先**: 图片不上传到任何服务器
- **低成本**: 可静态部署到 GitHub Pages / Vercel / Netlify
- **兼容性**: 支持主流现代浏览器 (Chrome, Firefox, Safari, Edge)

## External Dependencies
- **Astro**: 静态站点框架
- **React**: 交互组件框架
- **shadcn/ui**: UI 组件库（Button, Input, Slider, Card, Tabs 等）
- **TailwindCSS**: CSS 工具类框架
- **JSZip**: 批量导出 zip 打包
- **Canvas API**: 浏览器原生图片处理能力
