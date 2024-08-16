/** @jsxImportSource @builder.io/qwik */
import {
  component$,
  useSignal,
  useStore,
  $,
  type NoSerialize,
  noSerialize,
} from '@builder.io/qwik'
import { NotesDB } from '../shared/storage'
import { load, saveNoteDatas } from '../note/utils/file-format'
import { icon } from '../../utils/icons'

export const CreateNote = component$(() => {
  const isOpenedCreateNoteDialog = useSignal(false)
  const createMode = useSignal<'new' | 'file'>('new')
  const targetNnote = useSignal<NoSerialize<File>>()
  const createError = useSignal('')

  const newNoteData = useStore<{
    save: string
    name: string | null
  }>({
    name: null,
    save: 'local',
  })

  const create = $(async () => {
    const db = new NotesDB()

    if (createMode.value === 'file') {
      if (!targetNnote.value) {
        createError.value = 'ファイルを指定してください'
        return
      }
      const loadResult = await load(targetNnote.value)
      if (!loadResult.success) {
        createError.value = `Error: ${loadResult.error}`
      }
    }
    const noteFileBlob =
      targetNnote.value ??
      (await saveNoteDatas([
        {
          id: crypto.randomUUID(),
          blobs: {},
          type: 'text',
          canToJsonData: {
            html: 'これは新しいノートである',
          },
          timestamp: Date.now(),
        },
      ]))

    const noteFileBuff = new Uint8Array(await noteFileBlob.arrayBuffer())

    const added = await db.notes.add({
      name: newNoteData.name ?? '無題のノートブック',
      updated: new Date(),
      nnote: noteFileBuff,
    })

    location.href = `/app/notes/local-${added}`
  })
  return (
    <div>
      <div class="fixed right-0 bottom-0 m-5">
        <button
          onClick$={() => {
            isOpenedCreateNoteDialog.value = true
          }}
          type="button"
        >
          <div class="fab block md:hidden">
            <div class="flex justify-center place-items-center items-center">
              <div
                class="w-5 h-5 m-auto align-middle"
                dangerouslySetInnerHTML={icon('plus')}
              />
            </div>
          </div>
          <div class="items-center gap-2 filled-tonal-button hidden md:flex place-items-center">
            <div class="w-5 h-5" dangerouslySetInnerHTML={icon('plus')} />
            <div class="">新しいノート</div>
          </div>
        </button>
      </div>
      <div>
        {isOpenedCreateNoteDialog.value && (
          <div class="fixed top-0 left-0 w-full h-dvh bg-[#000a] p-3 grid place-items-center">
            <div class="rounded-lg border bg-background p-2">
              <div class="flex justify-between">
                <div class="text-2xl">新しいノートを作成</div>
                <div
                  class="w-8 h-8"
                  dangerouslySetInnerHTML={icon('x')}
                  onClick$={() => {
                    isOpenedCreateNoteDialog.value = false
                  }}
                />
              </div>
              <div>
                <div class="grid grid-cols-2 gap-1 border-b m-2">
                  <button
                    onClick$={() => {
                      createMode.value = 'new'
                    }}
                    class={
                      createMode.value === 'new'
                        ? 'border-secondary border-b'
                        : ''
                    }
                    type="button"
                  >
                    新しく作る
                  </button>
                  <button
                    onClick$={() => {
                      createMode.value = 'file'
                    }}
                    class={
                      createMode.value === 'file'
                        ? 'border-secondary border-b'
                        : ''
                    }
                    type="button"
                  >
                    ファイルから読み込む
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label>
                  <span>名前: </span>
                  <input
                    onInput$={(evt) => {
                      newNoteData.name = (evt.target as HTMLInputElement)?.value
                    }}
                    id="create-note-name"
                    value={newNoteData.name ?? '無題のノートブック'}
                    class="p-2 rounded-lg border bg-background text-on-background"
                  />
                </label>
                <label>
                  <span>保存先: </span>
                  <select
                    onInput$={(evt) => {
                      newNoteData.save = (
                        evt.target as HTMLSelectElement
                      )?.value
                    }}
                    id="create-note-save"
                    class="bg-background border-outline"
                  >
                    <option
                      value="local"
                      class="text-write border border-outline"
                    >
                      ローカル
                    </option>
                  </select>
                </label>
                {createMode.value === 'file' && (
                  <div>
                    <label>
                      nnoteファイル:
                      <input
                        type="file"
                        onInput$={(evt) => {
                          const file = (evt.target as HTMLInputElement)
                            .files?.[0]
                          targetNnote.value = noSerialize(file)
                          newNoteData.name =
                            newNoteData.name ??
                            file?.name.replace(/\.nnote$/, '') ??
                            null
                        }}
                      />
                    </label>
                  </div>
                )}
                <div class="grid justify-center">
                  <button
                    onClick$={() => {
                      create()
                    }}
                    class="filled-tonal-button text-center"
                    type="button"
                  >
                    作成
                  </button>
                </div>
                <div>{createError.value}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
