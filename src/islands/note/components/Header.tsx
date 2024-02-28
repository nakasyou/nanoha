
import IconArrowLeft from "@tabler/icons/arrow-left.svg?raw"
import IconPlayerPlay from "@tabler/icons/player-play.svg?raw"
import IconPencil from "@tabler/icons/pencil.svg?raw"
import IconMenu2 from "@tabler/icons/menu-2.svg?raw"
import IconEye from "@tabler/icons/eye.svg?raw"
import IconEyeOff from "@tabler/icons/eye-off.svg?raw"

import { removeIconSize } from "../utils/icon/removeIconSize"

import { noteBookState, setNoteBookState } from "../store"
import { Show, createSignal } from "solid-js"

export interface Props {}

const Header = (props: Props) => {
  return (
    <div class="w-full lg:w-10 lg:px-2 py-1 z-30 h-auto lg:h-[100dvh]">
      <div class="flex justify-between items-center flex-row lg:flex-col h-full">
        <div>
          <a href="/app">
            <div innerHTML={removeIconSize(IconArrowLeft)} class="w-8 h-8" />
          </a>
        </div>
        <div>
          <Show when={noteBookState.isSaved} fallback="未保存">
            保存済み
          </Show>
        </div>
        <Show when={!noteBookState.isEditMode}>
          <div>
            <div onClick={() => {
              setNoteBookState('sheetDefaultState', !noteBookState.sheetDefaultState)
            }} innerHTML={noteBookState.sheetDefaultState ? removeIconSize(IconEye) : removeIconSize(IconEyeOff)} />
          </div>
        </Show>
        <div class="flex items-center justify-center lg:flex-col">
          <div>
            <Show
              when={noteBookState.isEditMode}
              fallback={
                <button
                  class="w-8 h-8"
                  innerHTML={removeIconSize(IconPencil)}
                  onClick={() => setNoteBookState("isEditMode", true)}
                />
              }
            >
              <button
                class="w-8 h-8"
                innerHTML={removeIconSize(IconPlayerPlay)}
                onClick={() => setNoteBookState("isEditMode", false)}
              />
            </Show>
          </div>
          <div>
            <button class="w-8 h-8" innerHTML={removeIconSize(IconMenu2)} onClick={() => {
              setNoteBookState('isMenuActive', !noteBookState.isMenuActive)
            }}/>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Header
