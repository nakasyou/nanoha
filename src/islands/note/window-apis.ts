import { createEffect, createSignal } from "solid-js"

const [getVisualViewport, setVisualViewport] = createSignal<{
  data: VisualViewport | null
}>({
  data: null
})

if (globalThis.document) {
  const handleVisualViewportUpdate = () => {
    setVisualViewport({ data: visualViewport ?? null })
  }
  visualViewport?.addEventListener('resize', () => handleVisualViewportUpdate())
  visualViewport?.addEventListener('scroll', () => handleVisualViewportUpdate())
  handleVisualViewportUpdate()
}

export {
  getVisualViewport
}

