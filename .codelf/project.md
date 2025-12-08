## Image Watermark Tool

> 一款高效、纯前端运行的图片水印工具，帮助内容创作者和电商卖家快速保护图片版权。

> **项目目的**: 实现"即开即用"和"隐私安全"（图片不上传服务器），主要解决三类场景：全屏平铺水印、单个自由水印、批量固定水印。

> **项目状态**: 初始化阶段（使用 Astro 默认模板）

> **项目团队**: 独立开发者

> **技术栈**: Astro 5.x + TypeScript + Canvas API + Bun


## Dependencies

* astro (^5.16.4): 静态站点生成框架，零 JS 打包，SEO 友好


## Development Environment

> **包管理器**: Bun
> **开发命令**:
> - `bun dev` - 启动开发服务器
> - `bun build` - 构建生产版本
> - `bun preview` - 预览构建结果


## Structure

> 当前为 Astro 初始模板结构，后续将根据功能需求扩展

```
root
- .cursor/                    # Cursor IDE 配置
    - commands/               # OpenSpec 相关命令
        - openspec-apply.md
        - openspec-archive.md
        - openspec-proposal.md
- .gitignore
- AGENTS.md                   # AI 助手指引文件
- README.md                   # 项目说明文档
- astro.config.mjs            # Astro 框架配置
- bun.lock                    # Bun 依赖锁定文件
- node_modules/               # 依赖包目录
- openspec/                   # OpenSpec 规范目录
    - AGENTS.md               # OpenSpec AI 指引
    - changes/                # 变更提案目录
        - archive/            # 已归档的变更
    - project.md              # 项目上下文文档 (重要!)
    - specs/                  # 功能规范目录
- package.json                # 项目配置和依赖声明
- public/                     # 静态资源目录
    - favicon.svg             # 网站图标
- src/                        # 源代码目录 (核心!)
    - assets/                 # 资源文件
        - astro.svg           # Astro logo (模板文件，待删除)
        - background.svg      # 背景图 (模板文件，待删除)
    - components/             # Astro 组件目录 (后续放置水印编辑器等组件)
        - Welcome.astro       # 欢迎组件 (模板文件，待替换)
    - layouts/                # 布局组件目录
        - Layout.astro        # 基础布局组件
    - pages/                  # 页面路由目录
        - index.astro         # 首页 (入口页面)
- tsconfig.json               # TypeScript 配置
```

### 计划新增目录
```
src/
- utils/                      # 工具函数目录 (待创建)
    - watermark.ts            # 水印处理核心逻辑
    - canvas.ts               # Canvas 操作封装
    - image.ts                # 图片处理工具
```
