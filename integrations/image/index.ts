import type { LocalImageService, AstroConfig, ImageTransform } from 'astro'

const service = {
  getURL(options: ImageTransform, imageConfig: AstroConfig['image']) {
    const searchParams = new URLSearchParams()
    searchParams.append(
      'href',
      typeof options.src === 'string' ? options.src : options.src.src
    )
    options.width && searchParams.append('w', options.width.toString())
    options.height && searchParams.append('h', options.height.toString())
    options.quality && searchParams.append('q', options.quality.toString())
    options.format && searchParams.append('f', options.format)
    return `/image?${searchParams}`
  },
  parseURL(url: URL, imageConfig) {
    const params = url.searchParams
    return {
      src: params.get('href')!,
      width: params.has('w') ? parseInt(params.get('w')!) : undefined,
      height: params.has('h') ? parseInt(params.get('h')!) : undefined,
      format: params.get('f'),
      quality: params.get('q')
    }
  },
  async transform(
    buffer,
    options,
    imageConfig
  ) {
    console.log(options)
    return {
      data: buffer,
      format: options.forma
    }
  },
  getHTMLAttributes(options, imageConfig) {
    let targetWidth = options.width
    let targetHeight = options.height
    if (typeof options.src === 'object') {
      const aspectRatio = options.src.width / options.src.height

      if (targetHeight && !targetWidth) {
        targetWidth = Math.round(targetHeight * aspectRatio)
      } else if (targetWidth && !targetHeight) {
        targetHeight = Math.round(targetWidth / aspectRatio)
      }
    }

    const { src, width, height, format, quality, ...attributes } = options

    return {
      ...attributes,
      width: targetWidth,
      height: targetHeight,
      loading: attributes.loading ?? 'lazy',
      decoding: attributes.decoding ?? 'async'
    }
  }
} satisfies LocalImageService
export default service
