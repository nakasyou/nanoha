import { icon } from '../../../../utils/icons'

export const Controller = (props: {
  onRemove(): void
  onDownNote(): void
  onUpNote(): void

  noteIndex: number
  notesLength: number
}) => {
  return (
    <div class="flex justify-center gap-1 bg-surface text-on-surface">
      <button
        class="grid hover:drop-shadow drop-shadow-none disabled:opacity-40 rounded-full p-1 border"
        onClick={props.onRemove}
        type="button"
      >
        <div innerHTML={icon('x')} class="w-8 h-8" />
      </button>
      <button
        class="grid hover:drop-shadow drop-shadow-none disabled:opacity-40 rounded-full p-1 border"
        onClick={props.onUpNote}
        disabled={props.noteIndex === 0}
        type="button"
      >
        <div innerHTML={icon('arrowNarrowUp')} class="w-8 h-8" />
      </button>
      <button
        class="grid hover:drop-shadow drop-shadow-none disabled:opacity-40 rounded-full p-1 border"
        onClick={props.onDownNote}
        disabled={props.noteIndex === props.notesLength - 1}
        type="button"
      >
        <div innerHTML={icon('arrowNarrowDown')} class="w-8 h-8" />
      </button>
    </div>
  )
}
