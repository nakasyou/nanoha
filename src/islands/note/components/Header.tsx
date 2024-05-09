import IconArrowLeft from "@tabler/icons/outline/arrow-left.svg?raw"
import IconPlayerPlay from "@tabler/icons/outline/player-play.svg?raw"
import IconPencil from "@tabler/icons/outline/pencil.svg?raw"
import IconMenu2 from "@tabler/icons/outline/menu-2.svg?raw"
import IconEye from "@tabler/icons/outline/eye.svg?raw"
import IconEyeOff from "@tabler/icons/outline/eye-off.svg?raw"

import { removeIconSize } from "../utils/icon/removeIconSize"

import { noteBookState, setNoteBookState } from "../store"
import { Show, createSignal } from "solid-js"

export interface Props {}

const Header = (props: Props) => {
  return (
    <div class="w-full lg:w-10 lg:px-2 py-1 z-40 h-auto lg:h-[100dvh] lg:pb-5">
      <div class="flex justify-between items-center flex-row lg:flex-col h-full">
        <div>
          <a href="/app" title="ホームに戻る">
            <div innerHTML={removeIconSize(IconArrowLeft)} class="w-8 h-8" />
          </a>
        </div>
        <div>
          <Show when={noteBookState.isSaved} fallback="未保存">
            保存済み
          </Show>
        </div>
        <div class="flex items-center justify-center lg:flex-col">
          <div>
            <Show
              when={noteBookState.isEditMode}
              fallback={
                <button
                  class="w-8 h-8"
                  innerHTML={removeIconSize(IconPencil)}
                  title="編集モードに切り替える"
                  onClick={() => setNoteBookState("isEditMode", true)}
                />
              }
            >
              <button
                class="w-8 h-8"
                innerHTML={removeIconSize(IconPlayerPlay)}
                title="学習を開始する"
                onClick={() => setNoteBookState("isEditMode", false)}
              />
            </Show>
          </div>
          <div>
            <button title="メニューを開く" class="w-8 h-8 z-50" innerHTML={removeIconSize(IconMenu2)} onClick={() => {
              setNoteBookState('isMenuActive', !noteBookState.isMenuActive)
            }}/>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Header
