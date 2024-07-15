import {
  noteBookMetadata,
  noteBookState,
  notes,
  setNoteBookMetadata,
  setNoteBookState,
} from '../store'
import IconX from '@tabler/icons/outline/x.svg?raw'
import { removeIconSize } from '../utils/icon/removeIconSize'
import { save, type LoadError } from '../utils/file-format'
import { Dialog } from './utils/Dialog'
import { Show, createSignal } from 'solid-js'

const CloseBtn = () => {
  return (
    <button
      innerHTML={removeIconSize(IconX)}
      class="w-8 h-8"
      onClick={() => {
        setNoteBookState('isMenuActive', false)
      }}
      type="button"
    />
  )
}
export const Menu = () => {
  const [getLoadError, setLoadError] = createSignal<LoadError>()
  const [getCanEditTitle, setCanEditTitle] = createSignal(false)
  const [getNewTitle, setNewTitle] = createSignal('')

  const onSave = async () => {
    const fileDataBlob = await save(notes.notes())

    const atagForDownload = document.createElement('a')
    atagForDownload.download = 'project.nnote'

    atagForDownload.href = URL.createObjectURL(fileDataBlob)

    atagForDownload.click()
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
        class="fixed top-0 left-0 w-screen h-dvh transition-transform"
        classList={{
          'translate-x-0': noteBookState.isMenuActive,
          'translate-x-full lg:-translate-x-full': !noteBookState.isMenuActive,
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
              <div>
                <div class="text-center">
                  <Show
                    when={getCanEditTitle()}
                    fallback={
                      <>
                        <div class="text-3xl">{noteBookMetadata.noteName}</div>
                        <button
                          onClick={() => {
                            setCanEditTitle(true)
                            setNewTitle(noteBookMetadata.noteName)
                          }}
                          class="text-button"
                          type="button"
                        >
                          編集
                        </button>
                      </>
                    }
                  >
                    <div>
                      <label>
                        <div>新しい名前を入力:</div>
                        <input
                          value={noteBookMetadata.noteName}
                          onInput={(evt) =>
                            setNewTitle(evt.currentTarget.value)
                          }
                          class="p-1 rounded-full border text-xl text-center"
                        />
                      </label>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setNoteBookMetadata('noteName', getNewTitle())
                          setNoteBookState('isSaved', false)
                          setCanEditTitle(false)
                        }}
                        class="text-button"
                        type="button"
                      >
                        完了
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
              <div class="text-center">
                <div>保存場所: ローカル</div>
              </div>
              {/* セーブ/ロード */}
              <div>
                <div class="flex justify-center items-center gap-4">
                  <button class="filled-button" onClick={onSave} type="button">
                    エクスポート
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
