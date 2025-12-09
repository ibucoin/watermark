## ADDED Requirements

### Requirement: SEO 元数据
系统 SHALL 提供完整的 SEO 元数据以提升搜索引擎可见性和社交分享体验。

#### Scenario: Open Graph 标签
- **WHEN** 页面被加载
- **THEN** HTML head 包含 og:title、og:description、og:type 标签
- **AND** og:type 设置为 "website"

#### Scenario: Twitter Card 标签
- **WHEN** 页面被加载
- **THEN** HTML head 包含 twitter:card、twitter:title、twitter:description 标签
- **AND** twitter:card 设置为 "summary"

#### Scenario: 结构化数据
- **WHEN** 页面被加载
- **THEN** HTML head 包含 JSON-LD 格式的 WebApplication schema
- **AND** schema 包含 name、description、applicationCategory 字段

---

### Requirement: Sitemap 自动生成
系统 SHALL 自动生成 sitemap.xml 以便搜索引擎索引。

#### Scenario: 生成 Sitemap
- **WHEN** 项目构建完成
- **THEN** 在输出目录生成 sitemap.xml 文件
- **AND** sitemap 包含所有公开页面的 URL

---

### Requirement: Robots.txt 配置
系统 SHALL 提供 robots.txt 文件指导搜索引擎爬虫行为。

#### Scenario: 允许爬虫访问
- **WHEN** 爬虫请求 /robots.txt
- **THEN** 返回允许所有爬虫访问所有页面的配置
- **AND** 包含 sitemap.xml 的位置引用


