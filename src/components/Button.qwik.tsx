/** @jsxImportSource @builder.io/qwik */
import { component$, useSignal, type HTMLAttributes, type NoSerialize, useVisibleTask$, noSerialize, Slot } from '@builder.io/qwik'
import { type Wave, wave } from '@ns/ha'

export const Button = component$((props: HTMLAttributes<HTMLButtonElement>) => {
  const buttonRef = useSignal<HTMLButtonElement>()
  const buttonWave = useSignal<NoSerialize<Wave<{
    target: HTMLButtonElement
    duration: number
    color: string
  }>>>()

  useVisibleTask$(({ track }) => {
    track(buttonRef)
    if (!buttonRef.value) {
      return
    }
    buttonWave.value = noSerialize(wave({
      color: '#aaa',
      duration: 500,
      target: buttonRef.value
    }))
  })

  return <button {...props} ref={buttonRef} onClick$={(evt) => {
    if (buttonWave.value && buttonRef.value) {
      buttonWave.value.do({
        pos: evt
      })
      props.onClick$ && typeof props.onClick$ === 'function' && props.onClick$(evt, buttonRef.value)
    }
  }}>
    <Slot />
  </button>
})