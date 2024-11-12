export const Spinner = (props: {
  class?: string
}) => {
  return (
    <div
      classList={{ [props.class ?? '']: true }}
      class="animate-spin h-[1.2rem] w-[1.2rem] border-2 rounded-full border-t-transparent inline-block"
    />
  )
}
