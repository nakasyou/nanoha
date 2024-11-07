import { type EventHandler, type QRL, useOnDocument } from '@builder.io/qwik'

/**
 * Call cb when document is loaded even if you use Astro View Transitions API
 * @param cb Call back function
 */
export const handleLoaded = (cb: QRL<EventHandler>) => {
  useOnDocument('load', cb)
  useOnDocument('astro:page-load', cb)
}
