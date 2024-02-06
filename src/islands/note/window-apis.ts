import { createSignal } from "solid-js";

const [getVisualViewportHeight, setVisualViewportHeight] = createSignal<number>(0)

if (globalThis.document) {
  const handleVisualViewportUpdate = () => {
    setVisualViewportHeight(visualViewport?.height ?? 0)
  }
  visualViewport?.addEventListener('resize', () => handleVisualViewportUpdate())
  visualViewport?.addEventListener('scroll', () => handleVisualViewportUpdate())
  handleVisualViewportUpdate()
}

export {
  getVisualViewportHeight
}

