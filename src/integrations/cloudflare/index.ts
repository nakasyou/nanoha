import { type AstroConfig, type AstroIntegration } from "astro"
import { fileURLToPath } from "url"
import { compatibleNodeModules } from "./const/compatibleNodeModules"
import { build } from 'esbuild'
import * as fs from 'fs/promises'
import fg from 'fast-glob'
import path from 'path'

export default (): AstroIntegration => {
  let buildConfig: AstroConfig['build']

  return {
    name: "cloudflare-adapter",
    hooks: {
      "astro:config:done": ({ setAdapter, config }) => {
        buildConfig = config.build
        setAdapter({
          name: "cloudflare-adapter",
          serverEntrypoint: "./src/integrations/cloudflare/server/server.ts",
          supportedAstroFeatures: {
            staticOutput: "stable",
            serverOutput: "stable",
            assets: {
              
            }
          },
          exports: ["fetch"]
        })
      },
      "astro:build:done": async () => {
        await fs.writeFile('dist/_worker.js', 'import { fetch } from "./server/entry.mjs"\nexport default { fetch }')
        const clientFiles = await fg('./dist/client/**/*')

        await fs.writeFile('dist/_routes.json', JSON.stringify({
          version: 1,
          exclude: [...new Set([
            ...clientFiles.map(path => path.replace('./dist/client', '')),
            ...clientFiles.map(path => path.replace('./dist/client', '').replace(/index\.html$/, ''))
          ])],
          include: ['/*']
        }, null, 2))

        for (const file of clientFiles) {
          const content = await Bun.file(file).arrayBuffer()
          await Bun.write(path.join('dist', file.replace('./dist/client/', '')), content, {
            createPath: true
          })
        }
      }
    },
  }
}