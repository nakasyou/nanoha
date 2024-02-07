// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import deno from "./integrations/deno";

import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: process.env.IS_CF ? cloudflare() : deno(),
  integrations: [tailwind({}), solidJs(), svelte()],
  image: {
    service: {
      entrypoint: './integrations/image/index.ts',
      config: {
        
      }
    }
  }
});