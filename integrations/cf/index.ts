import { type AstroConfig, type AstroIntegration } from "astro"
import { fileURLToPath } from "url"
import { compatibleNodeModules } from "./const/compatibleNodeModules"
import { build } from 'esbuild'
import * as fs from 'node:fs/promises'

export default (): AstroIntegration => {
  let buildConfig: AstroConfig['build']

  return {
    name: "cf-adapter",
    hooks: {
      "astro:config:done": ({ setAdapter, config }) => {
        buildConfig = config.build
        setAdapter({
          name: "cf-adapter",
          serverEntrypoint: "./integrations/cf/server/server.ts",
          supportedAstroFeatures: {
            staticOutput: "stable",
            serverOutput: "stable",
            assets: {
              
            }
          },
          exports: ['fetch']
        })
      },
      "astro:build:done": async () => {
        await fs.copyFile(new URL('./server/_worker.ts', import.meta.url), 'dist/_worker.ts')
        const entryUrl = new URL(buildConfig.serverEntry, buildConfig.server)
        const entryPath = fileURLToPath(entryUrl)
        await build({
          target: "esnext",
          platform: 'node',
          bundle: true,
          allowOverwrite: true,
          entryPoints: ['dist/_worker.ts'],
          outfile: 'dist/_worker.js',
          format: "esm",
          external: [
            ...compatibleNodeModules.map((mod) => `node:${mod}`),
            "@astrojs/markdown-remark",
          ],
          minify: false,
          alias: {
            ...Object.fromEntries(compatibleNodeModules.map(mod => [mod, `node:${mod}`]))
          }
        })
      }
    },
  }
}
