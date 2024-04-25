/** @jsxImportSource @builder.io/qwik */
import {
  component$,
  type HTMLAttributes,
  type NoSerialize,
  noSerialize,
  Slot,
  useSignal,
  useVisibleTask$,
  useOnDocument,
  $
} from "@builder.io/qwik";
import { type Wave, wave } from "@ns/ha";

export const Button = component$((props: HTMLAttributes<HTMLButtonElement>) => {
  const buttonRef = useSignal<HTMLButtonElement>();
  const buttonWave = useSignal<
    NoSerialize<
      Wave<{
        target: HTMLButtonElement;
        duration: number;
        color: string;
      }>
    >
  >();
  const initWave = $(() => {
    if (!buttonRef.value) {
      return
    }
    buttonWave.value = noSerialize(
      wave({ color: "#aaa", duration: 500, target: buttonRef.value }),
    );
  });

  useVisibleTask$(({ track }) => {
    track(buttonRef);
    initWave()
  });
  useOnDocument('astro:page-load', initWave)
  useOnDocument('load', initWave)

  return (
    <button
      {...props}
      ref={buttonRef}
      onClick$={(evt) => {
        if (buttonWave.value && buttonRef.value) {
          buttonWave.value.do({
            pos: evt,
          });
          props.onClick$ && typeof props.onClick$ === "function" &&
            props.onClick$(evt, buttonRef.value);
        }
      }}
    >
      <Slot />
    </button>
  );
});
