/** @jsxImportSource @builder.io/qwik */
import { component$, useSignal, useStore, $ } from '@builder.io/qwik'
import { NotesDB } from '../note/notes-schema'
import { saveNoteDatas } from '../note/utils/file-format'

export const CreateNote = component$(() => {
  const isOpenedCreateNoteDialog = useSignal(false)

  const newNoteData = useStore<{
    save: string
    name: string
  }>({
    name: '無題のノートブック',
    save: 'local'
  })
  
  const create = $(async () => {
    const db = new NotesDB()
    const noteFileBlob = await saveNoteDatas([{
      id: crypto.randomUUID(),
      blobs: {},
      type: 'text',
      canToJsonData: {
        html: 'これは新しいノートである'
      }
    }])
    
    const noteFileBuff = new Uint8Array(await noteFileBlob.arrayBuffer())

    const added = await db.notes.add({
      name: newNoteData.name,
      updated: new Date(),
      nnote: noteFileBuff
    })

    location.href = `/app/notes/local-${added}`
  })
  return <div>
    <div class="fixed right-0 bottom-0 m-5">
      <button onClick$={() => {
        isOpenedCreateNoteDialog.value = true
      }}>
        <div class="fab block md:hidden">+</div>
        <div class="items-center gap-2 filled-tonal-button hidden md:flex">
          <div class="text-xl">+</div>
          <div class="">新しいノート</div>
        </div>
      </button>
    </div>
    <div>
      {
        isOpenedCreateNoteDialog.value && <div class="fixed top-0 left-0 w-full h-[100dvh] bg-[#000a] p-5">
          <div class="rounded-lg border bg-background p-2">
            <div class="text-2xl">新しいノートを作成</div>
            <div class="flex flex-col gap-2">
              <label>
                <span>保存先: </span>
                <select onInput$={(evt) => {
                  newNoteData.save = (evt.target as HTMLSelectElement)?.value
                }} id="create-note-save" class="bg-background border-outline">
                  <option value="local" class="text-write border border-outline">ローカル</option>
                </select>
              </label>
              <label>
                <span>名前: </span>
                <input onInput$={(evt) => {
                  newNoteData.name = (evt.target as HTMLInputElement)?.value
                }} id="create-note-name" value={newNoteData.name} class="p-2 rounded-lg border bg-background text-on-background" />
              </label>
              <div class="grid justify-center">
                <button onClick$={() => {
                  create()
                }} class="filled-tonal-button text-center">
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
})
