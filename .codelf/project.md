## Image Watermark Tool

> 一款高效、纯前端运行的图片水印工具，帮助内容创作者和电商卖家快速保护图片版权。

> **项目目的**: 实现"即开即用"和"隐私安全"（图片不上传服务器），主要解决三类场景：全屏平铺水印、单个自由水印、批量固定水印。

> **项目状态**: 核心功能已完成（水印编辑器 UI + 三种模式 + 导出功能）

> **项目团队**: 独立开发者

> **技术栈**: Astro 5.x + React + TypeScript + TailwindCSS + shadcn/ui + Canvas API + Bun


## Dependencies

* astro (^5.16.4): 静态站点生成框架
* @astrojs/react (^4.4.2): Astro React 集成
* @astrojs/tailwind (^6.0.2): Astro Tailwind 集成
* react (^19.2.1): React 框架
* react-dom (^19.2.1): React DOM
* tailwindcss (^4.1.17): CSS 工具类框架
* jszip (^3.10.1): ZIP 文件生成
* @radix-ui/react-* : shadcn/ui 底层组件
* lucide-react (^0.556.0): 图标库
* clsx, tailwind-merge, class-variance-authority: 样式工具


## Development Environment

> **包管理器**: Bun
> **开发命令**:
> - `bun dev` - 启动开发服务器
> - `bun build` - 构建生产版本
> - `bun preview` - 预览构建结果


## Structure

```
root
- .cursor/                    # Cursor IDE 配置
- .codelf/                    # Codelf 项目文档
- .gitignore
- AGENTS.md                   # AI 助手指引文件
- README.md                   # 项目说明文档
- astro.config.mjs            # Astro 框架配置（集成 React + Tailwind）
- tailwind.config.mjs         # Tailwind 配置（shadcn 预设）
- components.json             # shadcn/ui 配置
- tsconfig.json               # TypeScript 配置（含路径别名）
- bun.lock                    # Bun 依赖锁定文件
- node_modules/               # 依赖包目录
- package.json                # 项目配置和依赖声明
- openspec/                   # OpenSpec 规范目录
    - AGENTS.md               # OpenSpec AI 指引
    - changes/                # 变更提案目录
        - add-watermark-editor-ui/  # 水印编辑器提案（已完成）
        - archive/            # 已归档的变更
    - project.md              # 项目上下文文档
    - specs/                  # 功能规范目录
- public/                     # 静态资源目录
    - favicon.svg             # 网站图标
- src/                        # 源代码目录 (核心!)
    - styles/
        - globals.css         # 全局样式和 CSS 变量（shadcn 主题）
    - lib/
        - utils.ts            # cn() 样式合并工具函数
    - types/
        - watermark.ts        # 水印相关类型定义（重要!）
    - utils/
        - watermark.ts        # 水印渲染和导出核心逻辑（重要!）
    - components/
        - ui/                 # shadcn/ui 组件
            - button.tsx
            - input.tsx
            - label.tsx
            - slider.tsx
            - card.tsx
            - tabs.tsx
            - toggle.tsx
            - toggle-group.tsx
            - select.tsx
        - Toolbar/            # 工具栏组件
            - Toolbar.tsx     # 工具栏容器
            - ModeSelector.tsx # 模式选择器（平铺/单个/批量）
            - ColorPicker.tsx # 颜色选择器
            - SliderControl.tsx # 通用滑块控件
            - PositionSelector.tsx # 位置选择器（九宫格）
        - Canvas/             # Canvas 相关组件
            - ImageCanvas.tsx # Canvas 预览和渲染（重要!）
            - ImageUploader.tsx # 图片上传组件
        - Export/
            - ExportButton.tsx # 导出按钮组件
        - WatermarkEditor.tsx # 主编辑器组件（状态管理）
    - layouts/
        - Layout.astro        # 基础布局组件
    - pages/
        - index.astro         # 首页（入口页面）
```

### 核心文件说明
- `src/types/watermark.ts`: 定义水印配置、状态、模式等类型
- `src/utils/watermark.ts`: 水印渲染逻辑（平铺/单个/批量）和导出功能
- `src/components/WatermarkEditor.tsx`: 主状态管理和组件组合
- `src/components/Canvas/ImageCanvas.tsx`: Canvas 渲染和交互
