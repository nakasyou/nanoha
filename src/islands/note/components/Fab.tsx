import { createSignal } from 'solid-js'
import { icon } from '../../../utils/icons'
import { noteBookState, setNoteBookState } from '../store'

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
            <div innerHTML={icon('notebook')} class="w-5 h-5" />
          </button>
          <button
            title="スキャンノート"
            class="small-fab flex justify-center items-center touch-manipulation"
            onClick={() => props.onAddImageNote?.()}
            type="button"
          >
            <div innerHTML={icon('photoScan')} class="w-5 h-5" />
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
          <div innerHTML={icon('plus')} class="w-8 h-8" />
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
            noteBookState.sheetDefaultState ? icon('eye') : icon('eyeOff')
          }
        />
      )}
    </div>
  )
}
