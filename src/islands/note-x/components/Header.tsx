import IconArrowLeft from '@tabler/icons/arrow-left.svg?raw'
import IconPlayerPlay from '@tabler/icons/player-play.svg?raw'

import { removeIconSize } from '../utils/icon/removeIconSize'

import { noteBookState, setNoteBookState } from '../App'

const Header = () => {
  return <div class="mx-4 py-2">
    <div class="flex justify-between flex items-center">
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
