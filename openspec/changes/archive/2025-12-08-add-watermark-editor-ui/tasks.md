## 1. 项目配置
- [x] 1.1 安装依赖：@astrojs/react, @astrojs/tailwind, react, react-dom, jszip
- [x] 1.2 配置 astro.config.mjs 集成 React 和 Tailwind
- [x] 1.3 创建 tailwind.config.mjs 配置文件（shadcn 预设）
- [x] 1.4 创建全局 CSS 文件（CSS 变量 + shadcn 主题）
- [x] 1.5 初始化 shadcn/ui（创建 components.json）
- [x] 1.6 配置路径别名（tsconfig.json 中 @/ 指向 src/）

## 2. 安装 shadcn/ui 组件
- [x] 2.1 安装 button 组件
- [x] 2.2 安装 input 组件
- [x] 2.3 安装 slider 组件
- [x] 2.4 安装 card 组件
- [x] 2.5 安装 label 组件
- [x] 2.6 安装 select 组件
- [x] 2.7 安装 tabs 组件
- [x] 2.8 安装 toggle-group 组件

## 3. 页面布局
- [x] 3.1 更新 Layout.astro 基础布局
- [x] 3.2 创建 WatermarkEditor.tsx 主容器组件
- [x] 3.3 实现左右分栏布局（Toolbar + Canvas 区域）
- [x] 3.4 更新 index.astro 集成 WatermarkEditor

## 4. 工具栏组件
- [x] 4.1 创建 Toolbar.tsx 工具栏容器
- [x] 4.2 创建 ModeSelector.tsx 模式选择器（使用 shadcn Tabs）
- [x] 4.3 水印文字输入（使用 shadcn Input + Label）
- [x] 4.4 创建 ColorPicker.tsx 颜色选择器
- [x] 4.5 创建 SliderControl.tsx 通用滑块控件（使用 shadcn Slider + Label）
- [x] 4.6 创建 PositionSelector.tsx 位置选择器（使用 shadcn ToggleGroup）

## 5. 图片上传组件
- [x] 5.1 创建 ImageUploader.tsx 上传组件
- [x] 5.2 实现拖拽上传功能
- [x] 5.3 实现点击上传功能（使用 shadcn Button）
- [x] 5.4 支持多图上传（批量模式）
- [x] 5.5 添加文件类型和大小校验

## 6. Canvas 预览组件
- [x] 6.1 创建 ImageCanvas.tsx 预览组件
- [x] 6.2 实现图片加载和显示
- [x] 6.3 实现自适应缩放（预览尺寸）

## 7. 水印渲染逻辑
- [x] 7.1 创建 utils/watermark.ts 核心逻辑
- [x] 7.2 实现平铺水印渲染
- [x] 7.3 实现单个水印渲染
- [x] 7.4 实现批量水印渲染（固定位置）
- [x] 7.5 实现实时预览（参数变化时重绘）

## 8. 拖拽交互（单个模式）
- [x] 8.1 创建 DraggableWatermark.tsx 组件（集成在 ImageCanvas 中）
- [x] 8.2 实现鼠标拖拽定位
- [x] 8.3 同步拖拽位置到 Canvas 渲染

## 9. 批量模式
- [x] 9.1 实现多图缩略图网格显示
- [x] 9.2 实现图片切换预览
- [x] 9.3 实现统一水印配置应用

## 10. 导出功能
- [x] 10.1 创建 ExportButton.tsx 组件（使用 shadcn Button + Select）
- [x] 10.2 实现 PNG 导出
- [x] 10.3 实现 JPG 导出（带质量控制，使用 shadcn Slider）
- [x] 10.4 实现批量导出 + zip 打包下载

## 11. 优化和完善
- [x] 11.1 添加 loading 状态提示
- [x] 11.2 添加错误处理和提示
- [x] 11.3 响应式布局适配（移动端）- 基础支持
- [x] 11.4 清理 Astro 模板文件（Welcome.astro 等）
