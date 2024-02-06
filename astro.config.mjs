import { defineConfig } from 'astro/config';
import deno from "@astrojs/deno";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: process.env.IS_CF ? cloudflare() : deno(),
  integrations: [tailwind({}), solidJs(), svelte()],
  image: {
    service: passthroughImageService()
  }
});