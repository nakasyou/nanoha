import { defineConfig, squooshImageService, passthroughImageService } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import deno from './integrations/deno';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: deno(),
  integrations: [tailwind({
    
  }), solidJs(), svelte()],
  image: {
    service: passthroughImageService()
  }
});