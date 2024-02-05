// @ts-check
// @ts-ignore
import { Hono  } from 'hono'
import { App } from 'astro/app';
import path from 'node:path'

declare global {
  const Deno: {
    readFile (path: string): Promise<Uint8Array>
    serve (handler: (req: Request) => Promise<Response> | Response): void
  }
}

const mimetypeMap: Record<string, string | undefined> = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.svg': 'image/svg+xml'
}
export async function start (manifest: import('astro').SSRManifest) {
  const app = new App(manifest)

  const honoApp = new Hono()
  const setAsset = (assetData: {
    path: string
    filePath: string
  }) => {
    const ext = path.extname(assetData.path)
    const asset = {
      path: assetData.path,
      extname: ext,
      filePath: assetData.filePath,
      mimetype: mimetypeMap[ext] || ''
    }
    honoApp.all(asset.path, async (c) => {
      const file = await Deno.readFile(asset.filePath)
      const buff = file.buffer as ArrayBuffer
      
      if (asset.mimetype) {
        c.header('Content-Type', asset.mimetype)
      }
      return c.body(buff)
    })
  }
  const indexHtmlRegExp = /^.*\/index\.html$/
  const removeIndexHtmlRegExp = /\/index\.html$/
  for (const asset of [...manifest.assets]) {
    setAsset({
      path: asset,
      filePath: path.join('dist/client', asset)
    })
    if (indexHtmlRegExp.test(asset)) {
      setAsset({
        path: asset.replace(removeIndexHtmlRegExp, ''),
        filePath: path.join('dist/client', asset)
      })
    }
  }
  honoApp.all('/*', async (c) => {
    const res = await app.render(c.req.raw)
    return res
  })
  Deno.serve(honoApp.fetch);
}

