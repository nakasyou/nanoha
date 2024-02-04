import { removeIconSize } from "../../utils/icon/removeIconSize"
import IconX from '@tabler/icons/x.svg?raw'
import IconArrowNarrowUp from '@tabler/icons/arrow-narrow-up.svg?raw'
import IconArrowNarrowDown from '@tabler/icons/arrow-narrow-down.svg?raw'

export const Controller = (props: {
  onRemove (): void
  onDownNote (): void
  onUpNote (): void

  noteIndex: number
  notesLength: number
}) => {
  return <div class="flex justify-center gap-1">
    <button class="grid hover:drop-shadow drop-shadow-none disabled:drop-shadow-none disabled:bg-gray-100 rounded-full p-1 bg-white border" onClick={props.onRemove}>
      <div innerHTML={removeIconSize(IconX)} class="w-8 h-8" />
    </button>
    <button class="grid hover:drop-shadow drop-shadow-none disabled:drop-shadow-none disabled:bg-gray-100 rounded-full p-1 bg-white border"
      onClick={props.onUpNote}
      disabled={props.noteIndex === 0}>
      <div innerHTML={removeIconSize(IconArrowNarrowUp)} class="w-8 h-8" />
    </button>
    <button
      class="grid hover:drop-shadow drop-shadow-none disabled:drop-shadow-none disabled:bg-gray-100 rounded-full p-1 bg-white border"
      onClick={props.onDownNote}
      disabled={props.noteIndex === props.notesLength - 1}>
      <div innerHTML={removeIconSize(IconArrowNarrowDown)} class="w-8 h-8" />
    </button>
  </div>
}
