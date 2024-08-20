/** @jsxImportSource @builder.io/qwik */
import {
  component$,
  useContext,
  useSignal,
  useVisibleTask$,
  type JSXOutput,
  noSerialize,
} from '@builder.io/qwik'
import { SCREEN_STATE_CTX } from '../store'
import { loadNoteFromType } from '../../shared/storage'
import { getGeminiApiToken } from '../../shared/store'
import { load } from '../../note/utils/file-format'
import type { TextNoteData } from '../../note/components/notes/TextNote/types'

/**
 * 最初の画面
 */
export const InitialScreen = component$(() => {
  const screenState = useContext(SCREEN_STATE_CTX)
  const stateToLoad = useSignal<
    | {
        type: 'loading'
        state: string
      }
    | {
        type: 'error'
        error: string | JSXOutput
      }
    | {
        type: 'success'
      }
  >({
    type: 'loading',
    state: '読み込み中...',
  })

  useVisibleTask$(async () => {
    screenState.availableAI = !!getGeminiApiToken()

    // ノートの読み込み
    const gotNote = await loadNoteFromType(screenState.noteLoadType)

    if (!gotNote) {
      stateToLoad.value = {
        type: 'error',
        error: 'ノートが見つかりませんでした',
      }
      return
    }
    const loaded = await load(new Blob([gotNote.nnote]))
    if (!loaded.success) {
      stateToLoad.value = {
        type: 'error',
        error: 'ノートの形式が不正です',
      }
      return
    }
    document.title = `${gotNote.name} - Quiz with Nanoha`
    const textNotes = loaded.notes.filter(
      (note): note is TextNoteData => note.type === 'text',
    )
    screenState.note = noSerialize({
      name: gotNote.name,
      notes: textNotes,
    })
    for (let i = 0; i < textNotes.length; i++) {
      screenState.rangeNotes.add(textNotes[i]!.id)
    }
    stateToLoad.value = {
      type: 'success',
    }
  })
  useVisibleTask$(({ track }) => {
    track(() => screenState.availableAI)
    if (screenState.availableAI === false) {
      stateToLoad.value = {
        type: 'error',
        error: (
          <div>
            AI 機能を使用するための設定が完了していません。
            <a class="underline hover:no-underline" href="/app/settings#ai">
              設定
            </a>
            から変更してください
          </div>
        ),
      }
      return
    }
  })

  return (
    <div class="w-full h-full grid place-items-center">
      <div class="text-center">
        <div class="text-4xl font-bold">Quiz with AI</div>
        <hr class="my-2" />
        <div class="text-lg">AI によるスムーズな学習</div>
        <div>
          <button
            onClick$={() => {
              screenState.started = true
            }}
            type="button"
            class="filled-button m-3 disabled:opacity-40"
            disabled={stateToLoad.value.type !== 'success'}
          >
            Start
          </button>
          {stateToLoad.value.type === 'loading' && (
            <div class="text-on-surface-variant">{stateToLoad.value.state}</div>
          )}
          {stateToLoad.value.type === 'error' && (
            <div class="text-error">{stateToLoad.value.error}</div>
          )}
        </div>
      </div>
    </div>
  )
})
