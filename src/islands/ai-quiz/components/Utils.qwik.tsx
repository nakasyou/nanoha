/** @jsxImportSource @builder.io/qwik */
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const Loading = component$(() => {
  const dots = ['', '.', '..', '...']

  const dot = useSignal(0)
  useVisibleTask$(({ cleanup }) => {
    const id = setInterval(() => {
      dot.value = (dot.value + 1) % dots.length
    }, 300)
    cleanup(() => clearInterval(id))
  })

  return <>{dots[dot.value]}</>
})