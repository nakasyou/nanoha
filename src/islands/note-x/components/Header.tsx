import IconArrowLeft from '@tabler/icons/arrow-left.svg?raw'
import IconPlayerPlay from '@tabler/icons/player-play.svg?raw'

import { removeIconSize } from '../utils/icon/removeIconSize'

import { noteBookState, setNoteBookState } from '../App'

const Header = () => {
  return <div class="w-full md:w-10 md:px-2 py-2 bg-surface-variant z-10 h-auto md:h-screen">
    <div class="flex justify-between items-center flex-row md:flex-col h-full">
      <div>
        <a href="/app">
          <div innerHTML={removeIconSize(IconArrowLeft)} class='w-8 h-8' />
        </a>
      </div>
      {
        noteBookState.isEditMode && <div class="flex items-center">
          <button class="w-8 h-8" innerHTML={removeIconSize(IconPlayerPlay)} onClick={() => setNoteBookState('isEditMode', false)} />
        </div>
      }
    </div>
  </div>
}
export default Header
