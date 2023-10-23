import { type AstroConfig, type AstroIntegration } from "astro"
import { fileURLToPath } from "url"
import { compatibleNodeModules } from "./const/compatibleNodeModules"
import { build } from 'esbuild'

export default (): AstroIntegration => {
  let buildConfig: AstroConfig['build']

  return {
    name: "deno-adapter",
    hooks: {
      "astro:config:done": ({ setAdapter, config }) => {
        buildConfig = config.build
        setAdapter({
          name: "deno-adapter",
          serverEntrypoint: "./integrations/deno/server/server.js",
          supportedAstroFeatures: {
            staticOutput: "stable",

          },
        })
      },
      "astro:build:done": async () => {
        const entryUrl = new URL(buildConfig.serverEntry, buildConfig.server)
        const entryPath = fileURLToPath(entryUrl)
        await build({
          target: "esnext",
          platform: 'browser',
          bundle: true,
          allowOverwrite: true,
          entryPoints: [entryPath],
          outfile: entryPath,
          format: "esm",
          external: [
            ...compatibleNodeModules.map((mod) => `node:${mod}`),
            "@astrojs/markdown-remark",
          ],
          plugins: [],
          minify: true,
        })
        console.log(entryPath)
      }
    },
  }
}
import type {SSRManifest} from 'astro'
co