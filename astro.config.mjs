import { defineConfig } from 'astro/config';
import deno from "./integrations/cf";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import cloudflare from "@astrojs/cloudflare";
import { passthroughImageService } from 'astro/config';
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://nanoha.pages.dev",
  adapter: process.env.IS_CF ? cloudflare({
    
  }) : deno(),
  integrations: [tailwind({}), solidJs(), svelte(), sitemap()],
  image: {
    service: passthroughImageService()
  }
});