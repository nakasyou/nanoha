import { hc } from "hono/client"
import { onMount } from "solid-js"
import type { Routes } from "../../pages/api/[...path]"

export const Navbar = () => {
  onMount(async () => {
    const client = hc<Routes>('/')
    const a = await client.api.google["get-user-info"].$get().then(res => res.json())
    console.log(a)
  })
  return <div class="flex justfiy-between">
    <div>
      Home
    </div>
    <div>

    </div>
  </div>
}
