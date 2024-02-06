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
          serverEntrypoint: "./integrations/deno/server/server.ts",
          supportedAstroFeatures: {
            staticOutput: "stable",
            serverOutput: "stable",
            assets: {
              
            }
          },
        })
      },
      "astro:build:done": async () => {
        const entryUrl = new URL(buildConfig.serverEntry, buildConfig.server)
        const entryPath = fileURLToPath(entryUrl)
        await build({
          target: "esnext",
          platform: 'node',
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
          minify: false,
          alias: {
            'hono': 'https://deno.land/x/hono@v3.8.3/mod.ts',
            ...Object.fromEntries(compatibleNodeModules.map(mod => [mod, `node:${mod}`]))
          }
        })
      }
    },
  }
}
