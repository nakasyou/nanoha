import { component$ } from '@builder.io/qwik'

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
  
  return <div onClick$={() => console.log('a')}>
    aaa
  </div>
})
