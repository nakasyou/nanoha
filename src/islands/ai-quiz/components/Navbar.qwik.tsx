/** @jsxImportSource @builder.io/qwik */
import { component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { icon } from '../../../utils/icons'
import { SCREEN_STATE_CTX } from '../store'

const Settings = component$(() => {
  const screenState = useContext(SCREEN_STATE_CTX)
  return <div class="w-full h-dvh fixed z-20 top-0 left-0 bg-[#000a] grid items-center p-1">
    <div class="bg-surface rounded-lg p-2 border border-outline">
      <div class="text-2xl font-bold">設定</div>
      <hr />
      <div>
        <div class="text-xl">出題範囲</div>
        {
          typeof screenState.note === 'string' ? '読み込み中' : <div>
            {
              screenState.note!.notes.map((note) => {
                const text = new DOMParser().parseFromString(note.canToJsonData.html, 'text/html').documentElement.textContent ?? '空のノート'
                return <label key={note.id}>
                  <div class="flex">
                    <input type="checkbox" />
                    <div>
                      {text?.length > 20 ? `${text.substring(0, 20)}...` : text}
                    </div>
                  </div>
                </label>
              })
            }
          </div>
        }
      </div>
    </div>
  </div>
})
/**
 * Navbar
 */
export const Navbar = component$(() => {
  const isSettingsOpened = useSignal(false)
  return (
    <>
      {
        isSettingsOpened.value && <Settings />
      }
      <div class="flex flex-row lg:flex-col justify-between h-full w-full">
        <a class="w-8 h-8" href=".">
          <div dangerouslySetInnerHTML={icon('arrowLeft')} class="w-8 h-8" />
        </a>
        <button onClick$={() => {
          isSettingsOpened.value = !isSettingsOpened.value
        }} type="button" dangerouslySetInnerHTML={icon('settings')} class="w-8 h-8" />
      </div>
    </>
  )
})
