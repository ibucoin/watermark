# watermark-editor Specification

## Purpose
TBD - created by archiving change add-watermark-editor-ui. Update Purpose after archive.
## Requirements
### Requirement: 页面布局
系统 SHALL 提供左右分栏的页面布局，左侧为工具栏（固定宽度），右侧为图片操作区域（自适应宽度）。

#### Scenario: 默认布局显示
- **WHEN** 用户访问水印工具页面
- **THEN** 显示左侧工具栏和右侧图片操作区域
- **AND** 工具栏宽度固定为 280px
- **AND** 图片操作区域占据剩余空间

---

### Requirement: 水印模式选择
系统 SHALL 提供三种水印模式：平铺模式、单个模式、批量模式。

#### Scenario: 切换到平铺模式
- **WHEN** 用户选择平铺模式
- **THEN** 工具栏显示间距控制选项
- **AND** 水印在图片上全屏重复显示

#### Scenario: 切换到单个模式
- **WHEN** 用户选择单个模式
- **THEN** 工具栏隐藏间距控制选项
- **AND** 显示单个水印，支持拖拽定位

#### Scenario: 切换到批量模式
- **WHEN** 用户选择批量模式
- **THEN** 工具栏显示位置选择器（九宫格）
- **AND** 支持多图上传
- **AND** 水印统一应用到所有图片的指定位置

---

### Requirement: 水印文字配置
系统 SHALL 允许用户配置水印文字内容。

#### Scenario: 输入水印文字
- **WHEN** 用户在文字输入框中输入内容
- **THEN** 预览区域实时显示输入的水印文字

#### Scenario: 空文字处理
- **WHEN** 水印文字为空
- **THEN** 预览区域不显示水印

---

### Requirement: 水印颜色配置
系统 SHALL 允许用户配置水印颜色。

#### Scenario: 选择水印颜色
- **WHEN** 用户通过颜色选择器选择颜色
- **THEN** 预览区域的水印颜色实时更新

---

### Requirement: 水印透明度配置
系统 SHALL 允许用户配置水印透明度（0-100%）。

#### Scenario: 调整透明度
- **WHEN** 用户拖动透明度滑块
- **THEN** 预览区域的水印透明度实时更新
- **AND** 透明度范围为 0%（完全透明）到 100%（完全不透明）

---

### Requirement: 水印大小配置
系统 SHALL 允许用户配置水印字体大小。

#### Scenario: 调整字体大小
- **WHEN** 用户拖动大小滑块
- **THEN** 预览区域的水印大小实时更新
- **AND** 字体大小范围为 12px 到 200px

---

### Requirement: 水印角度配置
系统 SHALL 允许用户配置水印旋转角度。

#### Scenario: 调整旋转角度
- **WHEN** 用户拖动角度滑块
- **THEN** 预览区域的水印角度实时更新
- **AND** 角度范围为 -180° 到 180°

---

### Requirement: 水印间距配置（平铺模式）
系统 SHALL 在平铺模式下允许用户配置水印间距。

#### Scenario: 调整水印间距
- **GIVEN** 当前为平铺模式
- **WHEN** 用户拖动间距滑块
- **THEN** 预览区域的水印间距实时更新
- **AND** 间距范围为 50px 到 500px

---

### Requirement: 图片上传
系统 SHALL 支持用户上传图片文件。

#### Scenario: 拖拽上传图片
- **WHEN** 用户将图片文件拖拽到上传区域
- **THEN** 图片加载并显示在预览区域
- **AND** 自动应用当前水印配置

#### Scenario: 点击上传图片
- **WHEN** 用户点击上传按钮并选择图片文件
- **THEN** 图片加载并显示在预览区域
- **AND** 自动应用当前水印配置

#### Scenario: 批量上传图片
- **GIVEN** 当前为批量模式
- **WHEN** 用户上传多张图片
- **THEN** 显示所有图片的缩略图网格
- **AND** 可切换查看不同图片的水印预览

#### Scenario: 文件类型校验
- **WHEN** 用户上传非图片文件
- **THEN** 显示错误提示"仅支持 PNG、JPG、JPEG、WebP 格式"
- **AND** 不加载该文件

---

### Requirement: 水印位置选择（批量模式）
系统 SHALL 在批量模式下提供九宫格位置选择器。

#### Scenario: 选择水印位置
- **GIVEN** 当前为批量模式
- **WHEN** 用户在九宫格中选择一个位置（如右下角）
- **THEN** 所有图片的水印统一显示在该位置

---

### Requirement: 可拖拽水印（单个模式）
系统 SHALL 在单个模式下支持拖拽定位水印。

#### Scenario: 拖拽水印位置
- **GIVEN** 当前为单个模式
- **AND** 图片已加载
- **WHEN** 用户在预览区域拖拽水印
- **THEN** 水印位置实时跟随鼠标移动
- **AND** 松开鼠标后水印固定在新位置

---

### Requirement: 图片导出
系统 SHALL 支持将带水印的图片导出下载。

#### Scenario: 导出 PNG 格式
- **WHEN** 用户选择 PNG 格式并点击导出
- **THEN** 下载带水印的 PNG 图片
- **AND** 图片保持原始分辨率

#### Scenario: 导出 JPG 格式
- **WHEN** 用户选择 JPG 格式并点击导出
- **THEN** 显示质量控制滑块（0-100%）
- **AND** 下载带水印的 JPG 图片

#### Scenario: 批量导出 zip
- **GIVEN** 当前为批量模式
- **AND** 已上传多张图片
- **WHEN** 用户点击导出
- **THEN** 所有图片应用水印后打包为 zip 文件下载

---

### Requirement: 实时预览
系统 SHALL 在用户调整任何水印参数时实时更新预览。

#### Scenario: 参数变化实时预览
- **WHEN** 用户调整任何水印参数（文字/颜色/透明度/大小/角度/间距）
- **THEN** 预览区域在 100ms 内更新显示效果

---

### Requirement: 响应式布局
系统 SHALL 支持响应式布局，适配不同屏幕尺寸。

#### Scenario: 移动端布局
- **WHEN** 屏幕宽度小于 768px
- **THEN** 工具栏和图片区域改为上下布局
- **AND** 工具栏可折叠

