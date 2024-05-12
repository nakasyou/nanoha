/** @jsxImportSource @builder.io/qwik */

import { $, type NoSerialize, component$, useSignal, noSerialize, createContextId, useStore, useContextProvider, useContext, useVisibleTask$, type JSXOutput } from '@builder.io/qwik'
import type { NoteLoadType } from '../note/note-load-types'
import { handleLoaded } from '../shared/q-utils'
import { loadNoteFromType, type Notes } from '../shared/storage'
import { getGeminiApiToken } from '../shared/store'

interface Store {
  note: NoSerialize<Notes> | 'pending' | 'notfound'
  aiChecked: boolean | null
  isStarted: boolean
}
const STORE_CTX = createContextId<Store>('store')

const InitialScreen = component$(() => {
  const store = useContext(STORE_CTX)

  const loadingState = useSignal<string | null>('Loading...')
  const loadError = useSignal<string | null | JSXOutput>(null)

  useVisibleTask$(({ track }) => {
    track(() => store.note)

    if (store.note === 'notfound') {
      loadError.value = 'ノートが見つかりませんでした'
      return
    }
    if (store.note === 'pending') {
      loadingState.value = 'ノートを読み込んでいます...'
      return
    }
    if (store.aiChecked === null) {
      loadingState.value = 'AI機能をチェックしています...'
      return
    }
    if (store.aiChecked === false) {
      loadError.value = <div>AI 機能を使用するための設定が完了していません。<a class="underline hover:no-underline" href="/app/settings#ai">設定</a>から変更してください</div>
      return
    }
    loadingState.value = null
  })
  return <div class="w-full h-full grid place-items-center">
    <div class="text-center">
      <div class="text-4xl font-bold">Quiz with AI</div>
      <hr class="my-2" />
      <div class="text-lg">AI によるスムーズな学習</div>
      <div>
        <button onClick$={() => store.isStarted = true} class="filled-button m-3 disabled:opacity-40" disabled={loadingState.value !== null}>Start</button>
        {
          loadingState.value && <div class="text-on-surface-variant">{ loadingState.value }</div>
        }
        {
          loadError.value && <div class="text-error">{ loadError.value }</div>
        }
      </div>
    </div>
  </div>
})
const Header = component$(() => {
  return <div>
    This is header
  </div>
})

export default component$<{
  noteLoadType: NoteLoadType
}>((props) => {
  const store = useStore<Store>({
    note: 'pending',
    aiChecked: null,
    isStarted: false
  }, {
    deep: false
  })
  useContextProvider(STORE_CTX, store)

  handleLoaded($(async () => {
    const gotNote = await loadNoteFromType(props.noteLoadType)
    store.note = gotNote ? noSerialize(gotNote) : 'notfound'

    store.aiChecked = !!getGeminiApiToken()
  }))
  return <div class="flex flex-col h-[100dvh] lg:flex-row w-full">
    <div class="lg:h-[100dvh] lg:border-r border-b lg:border-b-0 border-r-0">
      <Header />
    </div>
    <div class="px-2 w-full pb-5 h-[100dvh] overflow-y-auto grow">
      {
        store.isStarted ? <InitialScreen /> : ''
      }
    </div>
  </div>
})