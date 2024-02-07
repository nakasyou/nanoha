import type { APIRoute } from 'astro'
// @ts-expect-error
import { getConfiguredImageService, imageConfig, assetsDir } from 'astro:assets'
import Vips from 'wasm-vips'
import fs from 'node:fs/promises'
import { isRemotePath, removeQueryString } from '@astrojs/internal-helpers/path';
const vips = await Vips()
import imageService from '../../integrations/image'

async function loadLocalImage(src: string, url: URL) {
  const filePath = import.meta.env.DEV
    ? removeQueryString(src.replace(/^\/@fs/, ''))
    : new URL('.' + src, assetsDir)
  return (await fs.readFile(filePath)).buffer
}

//photon.PhotonImage.new_from_base64('')
export const GET: APIRoute = async (c) => {
  const imagedata = await imageService.parseURL(c.url, imageConfig)

  const srcUrl = new URL(imagedata.src, 'file://')
  
  const ext = srcUrl.pathname.match(/\..+/)![0]
  const localImage = new Uint8Array(await loadLocalImage(imagedata?.src!, c.url))

  if (ext === '.svg') {
    return new Response(localImage, {
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    })
  }

  console.log('start')
  const image = vips.Image.newFromBuffer(localImage)
  const resize = (imagedata.width || image.width) / image.width
  
  const result = image.resize(resize).webpsaveBuffer()
  console.log('end')
  return new Response(result, {
    headers: {
      'Content-Type': 'image/webp'
    }
  })
}
