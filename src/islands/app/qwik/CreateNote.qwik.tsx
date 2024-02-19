import { component$, useSignal } from '@builder.io/qwik'

/*
<div id="create-note-dialog" hidden>
      <div class="fixed z-20 top-0 left-0 grid items-center justify-center w-full h-[100dvh] bg-[#000a]">
        <div class="bg-background border p-2 rounded">
          <div class="text-2xl">新しいノートを作成</div>
          <div class="flex flex-col gap-2">
            <label>
              <span>保存先: </span>
              <select id="create-note-save" class="bg-background border-outline">
                <option value="local" class="text-write border border-outline">ローカル</option>
              </select>
            </label>
            <label>
              <span>名前: </span>
              <input id="create-note-name" value="無題のノートブック" class="p-2 rounded-lg border bg-background text-on-background" />
            </label>
            <div class="grid justify-center">
              <button id="create-note-action" class="filled-tonal-button">作成</button>
            </div>
          </div>
        </div>
      </div>
    </div>*/
export const CreateNote = component$(() => {
  const isOpenedCreateNoteDialog = useSignal(false)
  return <div>
    <div>
      {
        isOpenedCreateNoteDialog.value && <div class="fixed top-0 left-0 w-full h-[100dvh] bg-[#000a] p-5">
          <div class="rounded-lg border bg-background">
            <div class="text-2xl">新しいノートを作成</div>
            <div class="flex flex-col gap-2">
            </div>
          </div>
        </div>
      }
    </div>
    <div class="fixed right-0 bottom-0 m-5">
      <button onClick$={() => {
        isOpenedCreateNoteDialog.value = true
      }}>
        <div class="flex items-center filled-tonal-button gap-2">
          <div class="text-xl">+</div>
          <div class="hidden md:block">新しいノート</div>
        </div>
      </button>
    </div>
  </div>
})
