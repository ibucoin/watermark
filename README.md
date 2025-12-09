# 图片水印工具

免费在线图片水印工具，支持平铺、单个、批量水印，纯前端处理，保护您的隐私。

## ✨ 功能特点

- **平铺水印** - 重复铺满整个图片，适合高强度版权保护
- **单个自由水印** - 可拖拽定位，支持多个水印叠加
- **批量处理** - 多图统一添加水印，一键导出 ZIP
- **隐私安全** - 纯前端处理，图片不上传服务器
- **多格式导出** - 支持 PNG、JPG 格式，可调节质量

## 🛠️ 技术栈

- **框架**: Astro 5.x + React
- **样式**: TailwindCSS + shadcn/ui
- **图片处理**: Canvas API
- **语言**: TypeScript
- **包管理**: Bun

## 🚀 快速开始

```bash
# 安装依赖
bun install

# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 预览构建结果
bun preview
```

开发服务器默认运行在 `http://localhost:4321`

## 📁 项目结构

```
src/
├── components/     # React 组件
│   ├── Canvas/     # 图片画布相关
│   ├── Export/     # 导出功能
│   ├── Toolbar/    # 工具栏组件
│   └── ui/         # shadcn/ui 基础组件
├── layouts/        # 页面布局
├── pages/          # 路由页面
├── utils/          # 工具函数
├── types/          # TypeScript 类型定义
└── styles/         # 全局样式
```

## 📄 License

MIT
