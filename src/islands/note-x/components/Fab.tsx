import { createSignal } from "solid-js"
import IconPlus from '@tabler/icons/plus.svg?raw'
import IconNote from '@tabler/icons/notebook.svg?raw'
import { removeIconSize } from "../utils/icon/removeIconSize"
export interface Props {
  onAddTextNote?: () =>  void
}
export default (props: Props) => {
  const [isOpen, setIsOpen] = createSignal(false)

return <div class="fixed right-0 bottom-0 m-4">
    {
      isOpen() && <div class="grid gap-2 justify-center mb-3">
        <div class="small-fab flex justify-center items-center" onClick={() => props.onAddTextNote && props.onAddTextNote()}>
          <div innerHTML={removeIconSize(IconNote)} class="w-5 h-5" />
        </div>
      </div>
    }
    <div class="fab flex justify-center items-center" onClick={() => {
      setIsOpen(!isOpen())
    }}>
      <div innerHTML={removeIconSize(IconPlus)} class="w-8 h-8" />
    </div>
  </div>
}
