
import { noteBookState, notes, setNoteBookState } from '../store'
import IconX from '@tabler/icons/x.svg?raw'
import { removeIconSize } from '../utils/icon/removeIconSize'
import { save, type LoadError } from '../utils/file-format'
import { Dialog } from './utils/Dialog'
import { Show, createSignal } from 'solid-js'
import { loadFromBlob } from './load-process'

const CloseBtn = () => {
  return (
    <button
      innerHTML={removeIconSize(IconX)}
      class="w-8 h-8"
      onClick={() => {
        setNoteBookState('isMenuActive', false)
      }}
    />
  )
}
export const Menu = () => {
  const [getLoadError, setLoadError] = createSignal<LoadError>()
  const onSave = async () => {
    const fileDataBlob = await save(notes.notes())

    const atagForDownload = document.createElement('a')
    atagForDownload.download = 'project.zip'

    atagForDownload.href = URL.createObjectURL(fileDataBlob)

    atagForDownload.click()
  }
  const onLoad = () => {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.oninput = async () => {
      const files = inputElement.files
      if (!files) {
        return
      }
      const targetFile = files[0]
      if (!targetFile) {
        return
      }

      const error = await loadFromBlob(targetFile)
      if (error) {
        setLoadError(error)
      }
    }
    inputElement.click()
  }

  return (
    <div class="">
      <Show when={getLoadError()}>
        <Dialog
          title="Load Error"
          type="alert"
          onClose={() => {
            setLoadError()
          }}
        >
          <div>ファイルの読み込みに失敗しました</div>
          <div>デバッグ用情報:</div>
          <div>
            Error Type: <code>{getLoadError()?.type}</code>
          </div>
          <pre>
            <code>{JSON.stringify(getLoadError()?.debug, null, 2)}</code>
          </pre>
        </Dialog>
      </Show>

      <div
        class="fixed top-0 left-0 w-screen h-[100dvh] transition-transform"
        classList={{
          'translate-x-0': noteBookState.isMenuActive,
          'translate-x-full lg:-translate-x-full': !noteBookState.isMenuActive
        }}
      >
        <div class="bg-background w-full h-full">
          <div class="flex flex-col w-full h-full">
            {/* クローズボタン */}
            <div class="flex justify-between items-center px-5 py-2">
              <div />
              <div class="block lg:hidden">
                <CloseBtn />
              </div>
            </div>
            <div class="flex-1">
              <div class="mx-5">
                <div class="text-2xl text-center">Menu</div>
              </div>
              <div class="text-center">
                <div>無題のノートブック</div>
                <div>
                  保存場所: None
                </div>
              </div>
              {/* セーブ/ロード */}
              <div>
                <div class="flex justify-center items-center gap-4">
                  <button class="filled-tonal-button" onClick={onLoad}>
                    Load
                  </button>
                  <button class="filled-button" onClick={onSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div class="hidden lg:block">
                <CloseBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
