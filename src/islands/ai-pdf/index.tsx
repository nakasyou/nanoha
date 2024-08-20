import { icon } from '../../utils/icons'
import type { NoteLoadType } from '../note/note-load-types'
import { App } from './App'

const Navbar = () => {
  return <div class="flex flex-row lg:flex-col justify-between h-full w-full">
    <a class="w-8 h-8" href=".">
      <div innerHTML={icon('arrowLeft')} class="w-8 h-8" />
    </a>
  </div>
}
export const AIPDf = (props: {
  noteLoadType: NoteLoadType
}) => {
  return <div class="flex flex-col h-dvh lg:flex-row w-full">
    <div class="lg:h-dvh lg:border-r border-b lg:border-b-0 border-r-0">
      <Navbar />
    </div>
    <div class="px-2 w-full pb-5 h-dvh overflow-y-auto grow">
      <App noteLoadType={props.noteLoadType} />
    </div>
  </div>
}
