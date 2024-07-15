import { createSignal } from 'solid-js'
import IconPlus from '@tabler/icons/outline/plus.svg?raw'
import IconNote from '@tabler/icons/outline/notebook.svg?raw'
import IconPhotoScan from '@tabler/icons/outline/photo-scan.svg?raw'

import { removeIconSize } from '../utils/icon/removeIconSize'
import { noteBookState, setNoteBookState } from '../store'

import IconEye from '@tabler/icons/outline/eye.svg?raw'
import IconEyeOff from '@tabler/icons/outline/eye-off.svg?raw'

export interface Props {
  onAddTextNote?: () => void
  onAddImageNote?: () => void
}

export default (props: Props) => {
  const EditModeFab = () => {
    const [isOpen, setIsOpen] = createSignal(false)

    return (
      <>
        <div
          class="grid gap-2 justify-center mb-3 transition duration-150 origin-bottom touch-manipulation"
          classList={{
            'scale-0': !isOpen(),
            'scale-100': isOpen(),
          }}
        >
          <button
            title="テキストノート"
            class="small-fab flex justify-center items-center touch-manipulation"
            onClick={() => props.onAddTextNote?.()}
            type="button"
          >
            <div innerHTML={removeIconSize(IconNote)} class="w-5 h-5" />
          </button>
          <button
            title="スキャンノート"
            class="small-fab flex justify-center items-center touch-manipulation"
            onClick={() => props.onAddImageNote?.()}
            type="button"
          >
            <div innerHTML={removeIconSize(IconPhotoScan)} class="w-5 h-5" />
          </button>
        </div>

        <button
          class="fab flex justify-center items-center touch-manipulation"
          onClick={() => {
            setIsOpen(!isOpen())
          }}
          title="ノートを追加する"
          type="button"
        >
          <div innerHTML={removeIconSize(IconPlus)} class="w-8 h-8" />
        </button>
      </>
    )
  }

  return (
    <div class="fixed right-0 bottom-0 m-4">
      {noteBookState.isEditMode ? (
        <EditModeFab />
      ) : (
        <button
          class="fab flex justify-center items-center touch-manipulation"
          title="一斉に隠す/表示する"
          onClick={() => {
            setNoteBookState(
              'sheetDefaultState',
              !noteBookState.sheetDefaultState,
            )
          }}
          type="button"
          innerHTML={
            noteBookState.sheetDefaultState
              ? removeIconSize(IconEye)
              : removeIconSize(IconEyeOff)
          }
        />
      )}
    </div>
  )
}
