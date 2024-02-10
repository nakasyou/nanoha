import { App } from 'astro/app'

export function createExports (manifest: import('astro').SSRManifest) {
  const app = new App(manifest)

  const fetch = async (req: Request): Promise<Response> => {
    const res = await app.render(req)
    return res
  }
  return {
    fetch
  }
}
