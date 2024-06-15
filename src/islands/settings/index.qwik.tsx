/** @jsxImportSource @builder.io/qwik */

import {
  $,
  component$,
  useOnDocument,
  useSignal
} from '@builder.io/qwik'
import { getGeminiApiToken } from '../shared/store'


export const GeminiApiToken = component$(() => {
  const hasGeminiApiToken = useSignal<boolean | null>(null)
  const isEditMode = useSignal<boolean>(false)
  const inputApiTokenValue = useSignal('')

  const onload = $(() => {
    hasGeminiApiToken.value = !!getGeminiApiToken()
  })
  useOnDocument('load', onload)
  useOnDocument('astro:page-load', onload)

  const handleSave = $(() => {
    localStorage.setItem('GEMINI_API_TOKEN', inputApiTokenValue.value)
    isEditMode.value = false
    onload()
  })
  const handleCancel = $(() => {
    isEditMode.value = false
  })
  return (
    <div class="">
      {isEditMode.value ? (
        <div class="grid grid-rows-2 place-items-center w-full max-w-80">
          <div class="w-full text-center">
            <input bind:value={inputApiTokenValue} class="border p-2 m-1 rounded-full w-full" placeholder="API Key" />
          </div>
          <div class="grid grid-cols-2">
            <button onClick$={handleCancel} class="text-button">Cancel</button>
            <button onClick$={handleSave} class="filled-button">Save</button>
          </div>
        </div>
      ) : (
        <div class='flex flex-wrap gap-2 items-center'>
          {
            hasGeminiApiToken.value === null ? '読み込み中' : 
            hasGeminiApiToken.value ? '設定されています' : '設定されていません'
          }
          <button class="text-button"
            onClick$={() => {
              isEditMode.value = true
            }}
          >
            編集
          </button>
        </div>
      )}
    </div>
  )
})
