import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site repository (TheBhardwajRohit.github.io), so the site is served from the domain root.
export default defineConfig({
  site: 'https://thebhardwajrohit.github.io',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
