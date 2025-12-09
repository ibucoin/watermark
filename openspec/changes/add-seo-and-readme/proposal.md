# Change: 添加完整 SEO 支持和 README 文档

## Why
项目需要部署到 Cloudflare Pages 并同步到 GitHub，需要完善 SEO 元数据以提升搜索引擎可见性，同时需要重写 README 让其他开发者了解如何运行项目。

## What Changes
- 添加完整 SEO 元数据（Open Graph、Twitter Card、结构化数据）
- 配置 Astro sitemap 和 robots.txt 插件
- 重写 README.md，包含项目介绍和运行说明

## Impact
- Affected specs: 无（纯配置和文档变更）
- Affected code:
  - `src/layouts/Layout.astro` - 添加 SEO meta 标签
  - `astro.config.mjs` - 添加 sitemap/robots 插件
  - `README.md` - 完全重写
  - `public/robots.txt` - 新增


