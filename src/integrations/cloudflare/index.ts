import { type AstroConfig, type AstroIntegration } from 'astro'
import * as fs from 'fs/promises'
import fg from 'fast-glob'
import path from 'path'

export default (): AstroIntegration => {
  let buildConfig: AstroConfig['build']

  return {
    name: 'cloudflare-adapter',
    hooks: {
      'astro:config:setup': ({ config, command }) => {
        if (command === 'build') {
          config.vite.plugins = [
            {
              name: 'qwik-resolve',
              resolveId(source, importer, options) {
                if (source === '@qwik-client-manifest') {
                  return source
                }
              },
              async load(id, options) {
                if (id.startsWith('@qwik-client-manifest')) {
                  const manifestPath = (await fg('./**/q-manifest.json'))[0]!
                  const manifestJson = await fs.readFile(manifestPath, {
                    encoding: 'utf-8'
                  })
                  return `export const manifest = (${manifestJson})`
                }
              },
              enforce: 'pre'
            },
            ...(config.vite.plugins ?? [])
          ]
        }
      },
      'astro:config:done': ({ setAdapter, config }) => {
        buildConfig = config.build
        setAdapter({
          name: 'cloudflare-adapter',
          serverEntrypoint: './src/integrations/cloudflare/server/server.ts',
          supportedAstroFeatures: {
            staticOutput: 'stable',
            serverOutput: 'stable',
            assets: {}
          },
          exports: ['fetch']
        })
      },
      'astro:build:done': async () => {
        await fs.writeFile(
          'dist/_worker.js',
          'import { fetch } from "./server/entry.mjs"\nglobalThis.process={env:{}};\nexport default { fetch }'
        )
        const clientFiles = await fg('./dist/client/**/*')

        await fs.writeFile(
          'dist/_routes.json',
          JSON.stringify(
            {
              version: 1,
              exclude: [
                ...new Set([
                  ...clientFiles.map((path) =>
                    path.replace('./dist/client', '')
                  ),
                  ...clientFiles.map((path) =>
                    path
                      .replace('./dist/client', '')
                      .replace(/index\.html$/, '')
                  )
                ])
              ],
              include: ['/*']
            },
            null,
            2
          )
        )

        for (const file of clientFiles) {
          const content = await fs.readFile(file)
          const targetPath = path.join('dist', file.replace('./dist/client/', ''))
          await fs.mkdir(path.dirname(targetPath), {
            recursive: true
          })
          await fs.writeFile(
            targetPath,
            content
          )
        }
      }
    }
  }
}
