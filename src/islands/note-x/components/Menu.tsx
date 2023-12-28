import { noteBookState, notes, setNoteBookState } from "../store"
import IconX from "@tabler/icons/x.svg?raw"
import { removeIconSize } from "../utils/icon/removeIconSize"
import { save } from "../utils/file-format"

const CloseBtn = () => {
  return (
    <button
      innerHTML={removeIconSize(IconX)}
      class="w-8 h-8"
      onClick={() => {
        setNoteBookState("isMenuActive", false)
      }}
    />
  )
}
export const Menu = () => {
  const onSave = async () => {
    const fileDataBlob = await save(notes.notes())

    const atagForDownload = document.createElement("a")
    atagForDownload.download = "project.zip"

    atagForDownload.href = URL.createObjectURL(fileDataBlob)

    atagForDownload.click()
  }
  return (
    <div class="">
      <div
        class="fixed top-0 left-0 w-screen h-[100dvh] transition-transform"
        classList={{
          "translate-x-0": noteBookState.isMenuActive,
          "translate-x-full lg:-translate-x-full": !noteBookState.isMenuActive,
        }}
      >
        <div class="bg-background w-full h-full">
          <div class="flex flex-col w-full h-full">
            <div class="flex justify-between items-center px-5 py-2">
              <div />
              <div class="block lg:hidden">
                <CloseBtn />
              </div>
            </div>
            <div class="flex-1">
              <div class="mx-5">
                <div class="text-2xl text-center">Menu</div>
              </div>
              <div>
                <div class="flex justify-center items-center gap-4">
                  <button
                    class="filled-button"
                  >
                    Load
                  </button>
                  <button class="filled-button" onClick={onSave}>Save</button>
                </div>
              </div>
            </div>
            <div>
              <div class="hidden lg:block">
                <CloseBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
