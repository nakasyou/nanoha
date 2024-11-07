/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*.svg?opt' {
  const exportDefault: {
    type: 'svg'
    svg: string
  }
  export default exportDefault
}
declare module '*?opt' {
  const exportDefault: {
    type: 'webp'
    sizes: {
      200: string
      400: string
      600: string
      800: string
      1200: string
    }
  }
  export default exportDefault
}
