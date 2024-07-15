import { removeIconSize } from '../../utils/icon/removeIconSize'
import IconX from '@tabler/icons/outline/x.svg?raw'
import IconArrowNarrowUp from '@tabler/icons/outline/arrow-narrow-up.svg?raw'
import IconArrowNarrowDown from '@tabler/icons/outline/arrow-narrow-down.svg?raw'

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
        <div innerHTML={removeIconSize(IconX)} class="w-8 h-8" />
      </button>
      <button
        class="grid hover:drop-shadow drop-shadow-none disabled:opacity-40 rounded-full p-1 border"
        onClick={props.onUpNote}
        disabled={props.noteIndex === 0}
        type="button"
      >
        <div innerHTML={removeIconSize(IconArrowNarrowUp)} class="w-8 h-8" />
      </button>
      <button
        class="grid hover:drop-shadow drop-shadow-none disabled:opacity-40 rounded-full p-1 border"
        onClick={props.onDownNote}
        disabled={props.noteIndex === props.notesLength - 1}
        type="button"
      >
        <div innerHTML={removeIconSize(IconArrowNarrowDown)} class="w-8 h-8" />
      </button>
    </div>
  )
}
