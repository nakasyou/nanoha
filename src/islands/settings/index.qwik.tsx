/** @jsxImportSource @builder.io/qwik */

import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const GeminiApiToken = component$(() => {
  const hasGeminiApiToken = useSignal<boolean | null>(null)
  const isEditMode = useSignal<boolean>(false)
  useVisibleTask$(() => {
    hasGeminiApiToken.value = !!localStorage.getItem('GEMINI_API_TOKEN')
  })
  return <div class="flex flex-wrap gap-2 items-center">
    <div>
      {
        hasGeminiApiToken.value === null ? '読み込み中' : 
          hasGeminiApiToken.value ? '設定されています' : '設定されていません'
      }
    </div>
    <div>
      {
        isEditMode.value ? <>
        </> : <button class="p-2 m-1 rounded-full border" onClick$={() => {
          isEditMode.value = true
        }}>編集</button>
      }
      
    </div>
  </div>
})