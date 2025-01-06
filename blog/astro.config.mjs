// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'https://testforge.blog',
    integrations: [
      mdx(), 
      sitemap(), 
      partytown(),
      react(),
      tailwind({
        applyBaseStyles: false,
      })
    ],
});
