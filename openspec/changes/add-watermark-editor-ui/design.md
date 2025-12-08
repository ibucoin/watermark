## Context
构建一个纯前端的图片水印工具，所有处理在浏览器端完成，无需后端服务。用户为独立开发者，追求高效、低成本、易维护。

### 技术约束
- Astro 5.x 作为框架
- 纯前端处理，图片不上传服务器
- 支持主流现代浏览器

### 用户场景
- 内容创作者：快速添加版权水印
- 电商卖家：批量处理商品图片

## Goals / Non-Goals

### Goals
- 提供直观的水印编辑界面
- 支持三种水印模式（平铺、单个、批量）
- 实时预览水印效果
- 支持 PNG/JPG 导出
- 批量处理时提供 zip 打包下载

### Non-Goals
- 不支持视频水印
- 不支持图片水印（仅文字水印）
- 不提供水印模板库
- 不保存用户历史记录到服务器

## Decisions

### 1. 交互框架：React + Astro Islands
**决策**: 使用 React 组件配合 Astro 的 `client:load` 指令

**理由**:
- 水印编辑器需要复杂的状态管理（多个参数联动）
- 拖拽交互需要响应式更新
- React 生态成熟，组件复用性强

**替代方案**:
- 纯 JS/TS：状态管理复杂，代码难以维护
- Vue：同样可行，但 React 与 Astro 集成更成熟

### 2. 样式方案：TailwindCSS + shadcn/ui 组件库
**决策**: 直接使用 shadcn/ui 组件库

**理由**:
- shadcn/ui 提供高质量的 React 组件，开箱即用
- 组件源码直接复制到项目中，可完全定制
- 与 TailwindCSS 深度集成，样式一致性好
- 提供 Button、Input、Slider、Card、Select 等常用组件
- 减少重复造轮子，加快开发速度

### 3. Canvas 渲染策略
**决策**: 使用 OffscreenCanvas（如支持）或主线程 Canvas

**理由**:
- 大图片处理可能阻塞 UI
- OffscreenCanvas 可在 Worker 中运行
- 降级方案：主线程 Canvas + 防抖

### 4. 批量下载：JSZip
**决策**: 使用 JSZip 库打包多图下载

**理由**:
- 成熟稳定的 zip 库
- 支持流式压缩，内存友好
- 浏览器兼容性好

## UI 架构

```
+------------------------------------------+
|  Header (Logo + 标题)                     |
+----------+-------------------------------+
|          |                               |
| Toolbar  |     ImageCanvas               |
| (固定宽度)|     (自适应)                  |
|          |                               |
| [模式]    |   [未加载] 上传区域           |
| [文字]    |   [已加载] Canvas 预览        |
| [颜色]    |   [批量] 缩略图网格           |
| [透明度]  |                               |
| [大小]    |                               |
| [角度]    |                               |
| [间距]    |                               |
| [位置]    |                               |
|          |                               |
| [导出]    |                               |
+----------+-------------------------------+
```

## 组件结构

```
src/components/
├── WatermarkEditor.tsx      # 主容器，管理全局状态
├── Toolbar/
│   ├── Toolbar.tsx          # 工具栏容器
│   ├── ModeSelector.tsx     # 模式选择器（平铺/单个/批量）
│   ├── ColorPicker.tsx      # 颜色选择器
│   ├── SliderControl.tsx    # 通用滑块（透明度/大小/角度/间距）
│   └── PositionSelector.tsx # 位置选择器（批量模式九宫格）
├── Canvas/
│   ├── ImageCanvas.tsx      # Canvas 预览组件
│   ├── ImageUploader.tsx    # 图片上传组件
│   └── DraggableWatermark.tsx # 可拖拽水印层（单个模式）
├── Export/
│   └── ExportButton.tsx     # 导出按钮（PNG/JPG/批量zip）
└── ui/                      # shadcn/ui 组件（通过 CLI 安装）
    ├── button.tsx           # shadcn Button
    ├── input.tsx            # shadcn Input
    ├── slider.tsx           # shadcn Slider
    ├── card.tsx             # shadcn Card
    ├── label.tsx            # shadcn Label
    ├── select.tsx           # shadcn Select
    ├── tabs.tsx             # shadcn Tabs（模式切换）
    └── toggle-group.tsx     # shadcn ToggleGroup（位置选择）
```

## 状态设计

```typescript
interface WatermarkState {
  // 水印参数
  text: string;
  color: string;
  opacity: number;       // 0-100
  fontSize: number;      // px
  angle: number;         // -180 to 180
  spacing: number;       // px (仅平铺模式)
  
  // 模式
  mode: 'tile' | 'single' | 'batch';
  
  // 单个模式位置
  position: { x: number; y: number };
  
  // 批量模式锚点
  anchor: 'top-left' | 'top-center' | 'top-right' 
        | 'center-left' | 'center' | 'center-right'
        | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  // 图片
  images: File[];
  currentImageIndex: number;
  
  // 导出
  exportFormat: 'png' | 'jpg';
  jpgQuality: number;    // 0-100 (仅 jpg)
}
```

## Risks / Trade-offs

### Risk 1: 大图片处理性能
**风险**: 处理高分辨率图片时可能卡顿
**缓解**: 
- 预览时使用缩放后的图片
- 导出时才使用原图
- 添加 loading 状态提示

### Risk 2: 批量处理内存占用
**风险**: 同时处理多张大图可能导致内存溢出
**缓解**:
- 限制单次上传数量（建议 20 张）
- 逐张处理后释放内存
- 提示用户分批处理

### Risk 3: 浏览器兼容性
**风险**: 部分 Canvas API 在旧浏览器不支持
**缓解**:
- 检测 API 支持情况
- 提供降级方案
- 明确支持的浏览器版本

## Migration Plan
无需迁移，这是新功能开发。

## Open Questions
1. 是否需要支持自定义字体？（当前仅使用系统字体）
2. 是否需要保存用户偏好到 localStorage？
3. 批量上传的数量限制具体是多少？

