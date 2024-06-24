// @ts-check
import { Hono } from 'hono'
import { App } from 'astro/app'

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
