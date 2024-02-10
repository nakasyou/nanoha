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
          serverEntrypoint: "./integrations/cf-pages/server/server.ts",
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
        await fs.copyFile(new URL('./server/_worker.js', import.meta.url), 'dist/_worker.js')
        const entryUrl = new URL(buildConfig.serverEntry, buildConfig.server)
        const entryPath = fileURLToPath(entryUrl)
      }
    },
  }
}
