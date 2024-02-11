import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import { passthroughImageService } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import cloudflare from '@astrojs/cloudflare'
import { imagetools } from 'vite-imagetools'

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://nanoha.pages.dev",
  adapter: cloudflare(),
  integrations: [
    tailwind({}),
    solidJs(),
    svelte(),
    sitemap()
  ],
  image: {
    service: passthroughImageService()
  },
  vite: {
    plugins: [
      imagetools({
        exclude: [
          /\?opt$/
        ]
      }),
      {
        name: 'image-optimize',
        enforce: 'pre',
        load (id, options) {
          if (id.endsWith('.svg?opt')) {
            return {
              code: `import target from '${id.replace(/\?opt$/, '')}?raw';export default { type: 'svg', svg: target }`
            }
          }
          if (id.endsWith('?opt')) {
            const widths = [200, 400, 600, 800, 1200]

            let code = `const result = { type: 'webp', sizes: {} }`

            for (const width of widths) {
              code += `
                import image${width} from '${id.replace(/\?opt$/, '')}?w=${width}&format=webp';
                result.sizes[${width}] = image${width};
              `
            }
            code += `export default result`
            return {
              code
            }
          }
        },
      }
    ]
  }
});