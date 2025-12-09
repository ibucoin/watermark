// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 部署后需要更新为实际域名
  // site: 'https://your-domain.com',
  integrations: [
    react(),
    sitemap(),
  ],
});
