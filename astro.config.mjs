import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import { passthroughImageService } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import cloudflare from '@astrojs/cloudflare'

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://nanoha.pages.dev",
  adapter: cloudflare(),
  integrations: [tailwind({}), solidJs(), svelte(), sitemap()],
  image: {
    service: passthroughImageService()
  }
});