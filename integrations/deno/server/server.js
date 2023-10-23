import { App } from 'astro/app';

/**
 * @param {import('astro').SSRManifest} manifest 
 */
export function start(manifest) {
  const app = new App(manifest);
  console.log(manifest.routes)
  Deno.serve((request) => {
    return app.render(request)
  })
}