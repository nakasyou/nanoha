import { defineConfig, squooshImageService, passthroughImageService } from 'astro/config';

import deno from "@astrojs/deno";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [tailwind(), solidJs(), svelte()],
  image: {
    service: passthroughImageService()
  }
});