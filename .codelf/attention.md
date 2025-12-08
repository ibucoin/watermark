## Development Guidelines

### Framework and Language
> Astro 5.x + TypeScript 纯前端架构

**Framework Considerations:**
- Version Compatibility: 使用 Astro 5.x，确保依赖兼容性
- Feature Usage: 利用 Astro 的零 JS 打包特性，优化性能
- Performance Patterns: 使用 Astro Islands 架构，按需加载交互组件
- Upgrade Strategy: 关注 Astro 官方更新，保持框架版本最新
- Importance Notes for Framework: 
	* Astro 组件默认不发送 JS 到客户端，需要交互的组件使用 `client:*` 指令
	* 图片处理逻辑需要在客户端运行，使用 `<script>` 标签或框架组件

**Language Best Practices:**
- Type Safety: 使用 TypeScript 严格模式 (tsconfig extends astro/tsconfigs/strict)
- Modern Features: 使用 ES2022+ 特性
- Consistency: 组件使用 PascalCase，工具函数使用 camelCase
- Documentation: 使用中文注释说明业务逻辑

### Code Abstraction and Reusability
> 纯前端架构，所有图片处理在浏览器端完成

**Modular Design Principles:**
- Single Responsibility: Canvas 操作、水印逻辑、UI 组件分离
- High Cohesion, Low Coupling: 水印处理逻辑独立于 UI 组件
- Stable Interfaces: 暴露简洁的水印 API，内部实现可迭代

**Reusable Component Library:**
```
src/
- components/          # Astro UI 组件
    - WatermarkEditor.astro   # 水印编辑器主组件 (待创建)
    - ImageUploader.astro     # 图片上传组件 (待创建)
    - WatermarkPreview.astro  # 预览组件 (待创建)
- utils/               # 工具函数 (待创建)
    - watermark.ts     # 水印核心逻辑：平铺、单个、批量
    - canvas.ts        # Canvas 操作封装
    - image.ts         # 图片加载、导出、压缩
```

### Coding Standards and Tools
**Code Formatting Tools:**
- TypeScript 严格模式 (内置于 Astro)
- Astro scoped styles (组件级 CSS 隔离)

**Naming and Structure Conventions:**
- Semantic Naming: 变量/函数名清晰表达用途
- Consistent Naming Style: 
  * 组件: PascalCase (如 `WatermarkEditor.astro`)
  * 函数: camelCase (如 `applyWatermark`)
  * CSS: Astro scoped styles，无需特殊命名约定
- Directory Structure: 按功能职责划分

### Frontend-Backend Collaboration Standards
**本项目为纯前端架构，无后端服务**

**Data Flow:**
- 图片数据流: 用户上传 → Canvas 处理 → 导出下载
- 状态管理: 使用原生 JS/TS 管理组件状态，无需状态管理库
- 数据持久化: 使用 localStorage 保存用户偏好设置（如默认水印文字、透明度等）

### Performance and Security
**Performance Optimization Focus:**
- 资源加载: Astro 零 JS 打包，按需加载交互组件
- 图片处理: 使用 Canvas API 在客户端处理，避免大图片阻塞 UI
- 内存管理: 处理完成后释放 Canvas 和图片对象

**Security Measures:**
- 隐私保护: 图片不上传服务器，全部本地处理
- 输入验证: 验证上传文件类型和大小
- 无敏感数据: 无用户认证，无数据库
