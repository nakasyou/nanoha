import { hc } from "hono/client"
import { Show, createSignal, onMount } from "solid-js"
import type { Routes } from "../../pages/api/[...path]"
import homeIcon from '@tabler/icons/home.svg?raw'
import userIcon from '@tabler/icons/user.svg?raw'
import { removeIconSize } from "../note/utils/icon/removeIconSize"

export const Navbar = () => {
  const [getIconUrl, setIconUrl] = createSignal<string | null>(null)
  onMount(async () => {
    const client = hc<Routes>('/')
    const data = await client.api.google["get-user-info"].$get().then(res => res.json())
    
    setIconUrl('/api/google/get-avater')
  })
  return <div class="shrink h-[100dvh]">
    <div class="flex justify-between flex-col h-full py-2">
      <div>
        <a innerHTML={homeIcon} class="p-5" href='/app' />
      </div>
      <div>
        <a class="w-8 h-8" href="/app/notes/aa">
          <Show when={getIconUrl()} fallback={<span innerHTML={removeIconSize(userIcon)}></span>}>
            <img src={getIconUrl()!} class="w-9 h-9 rounded-full" />
          </Show>
        </a>
      </div>
    </div>
  </div>
}
