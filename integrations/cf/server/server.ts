import { App } from 'astro/app'

export async function createExports (manifest: import('astro').SSRManifest) {
  const app = new App(manifest)
  return {
    async fetch (req: Request): Promise<Response> {
      const res = await app.render(req)
      return res
    }
  }
}
