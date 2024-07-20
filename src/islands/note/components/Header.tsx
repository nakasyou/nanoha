import iconAiQuiz from '../../../assets/icons/aiquiz.svg?raw'

import { icon } from '../../../utils/icons'

import { noteBookState, setNoteBookState } from '../store'
import { Show, createSignal, onMount } from 'solid-js'
import { getGeminiApiToken } from '../../shared/store'
import { Dialog } from './utils/Dialog'
import type { NoteLoadType } from '../note-load-types'

const Header = () => {
  const [getIsAIQuizActive, setIsAIQuizActive] = createSignal<boolean>()
  const [getIsShownAIQuizDialog, setIsShownAIQuizDialog] =
    createSignal<boolean>(false)
  onMount(() => {
    setIsAIQuizActive(!!getGeminiApiToken())
  })
  return (
    <>
      <Show when={getIsShownAIQuizDialog()}>
        <Dialog
          type="confirm"
          onClose={(result) => {
            if (result) {
              location.href = '/app/settings#ai'
            }
            setIsShownAIQuizDialog(false)
          }}
          title="AIクイズ"
        >
          <div>
            AIクイズでは、AIを用いたクイズによる学習支援が行えます。それには、AIの機能が必要です。設定を開きますか？
          </div>
        </Dialog>
      </Show>
      <div class="w-full lg:w-10 lg:px-2 py-1 z-40 h-auto lg:h-dvh lg:pb-5">
        <div class="flex justify-between items-center flex-row lg:flex-col h-full">
          <div>
            <a href="/app" title="ホームに戻る">
              <div innerHTML={icon('arrowLeft')} class="w-8 h-8" />
            </a>
          </div>
          <div>
            <Show when={noteBookState.isSaved} fallback="未保存">
              保存済み
            </Show>
          </div>
          <div class="flex items-center justify-center lg:flex-col">
            <div>
              <Show
                when={noteBookState.isEditMode}
                fallback={
                  <button
                    class="w-8 h-8"
                    innerHTML={icon('pencil')}
                    title="編集モードに切り替える"
                    onClick={() => setNoteBookState('isEditMode', true)}
                    type="button"
                  />
                }
              >
                <button
                  class="w-8 h-8"
                  innerHTML={icon('playerPlay')}
                  title="学習を開始する"
                  onClick={() => setNoteBookState('isEditMode', false)}
                  type="button"
                />
              </Show>
            </div>
            <div>
              <button
                onClick={() => {
                  if (getIsAIQuizActive()) {
                    const loadType: NoteLoadType | undefined =
                      noteBookState.loadType
                    if (!loadType) {
                      return
                    }
                    if (loadType.from === 'local') {
                      location.href = `/app/notes/local-${loadType.id}/quiz`
                    }
                  } else {
                    setIsShownAIQuizDialog(true)
                  }
                }}
                title="AIを搭載したクイズを開く"
                class="w-8 h-8"
                innerHTML={iconAiQuiz}
                type="button"
              />
            </div>
            <div>
              <button
                title="メニューを開く"
                class="w-8 h-8 z-50"
                innerHTML={icon('menu2')}
                onClick={() => {
                  setNoteBookState('isMenuActive', !noteBookState.isMenuActive)
                }}
                type="button"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Header
