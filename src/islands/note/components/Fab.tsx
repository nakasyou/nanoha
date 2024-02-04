import { createSignal } from "solid-js"
import IconPlus from '@tabler/icons/plus.svg?raw'
import IconNote from '@tabler/icons/notebook.svg?raw'
import IconPhotoScan from '@tabler/icons/photo-scan.svg?raw'

import { removeIconSize } from "../utils/icon/removeIconSize"
import { noteBookState, setNoteBookState } from '../store'
import Pencil from '@tabler/icons/pencil.svg?raw'

export interface Props {
  onAddTextNote?: () =>  void
  onAddImageNote?: () =>  void
}

export default (props: Props) => {
  const EditModeFab = () => {
    const [isOpen, setIsOpen] = createSignal(false)
    
    return <>
      <div class="grid gap-2 justify-center mb-3 transition duration-75 origin-bottom touch-manipulation" classList={{
        'scale-0': !isOpen(),
        'scale-100': isOpen()
      }}>
        <div class="small-fab flex justify-center items-center touch-manipulation" onClick={() => props.onAddTextNote && props.onAddTextNote()}>
          <div innerHTML={removeIconSize(IconNote)} class="w-5 h-5" />
        </div>
        <div class="small-fab flex justify-center items-center touch-manipulation" onClick={() => props.onAddImageNote && props.onAddImageNote()}>
          <div innerHTML={removeIconSize(IconPhotoScan)} class="w-5 h-5" />
        </div>
      </div>
      
      <div class="fab flex justify-center items-center touch-manipulation" onClick={() => {
        setIsOpen(!isOpen())
      }}>
        <div innerHTML={removeIconSize(IconPlus)} class="w-8 h-8" />
      </div>
    </>
  }

  return <div class="fixed right-0 bottom-0 m-4">
    {
      noteBookState.isEditMode ? <EditModeFab /> :
      <button class="fab flex justify-center items-center touch-manipulation"
        onClick={() => {
          setNoteBookState('isEditMode', true)
        }} innerHTML={Pencil} />
    }
  </div>
}
