import { App } from 'astro/app'
// @ts-check
import { Hono } from 'hono'

export function createExports(manifest: import('astro').SSRManifest) {
  const app = new App(manifest)

  const honoApp = new Hono()

  honoApp.all('/*', async (c) => {
    const res = await app.render(c.req.raw)
    return res
  })
  return {
    fetch: honoApp.fetch,
  }
}
