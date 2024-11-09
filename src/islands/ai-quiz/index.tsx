import { createSignal, onMount, Show } from 'solid-js'
import type { NoteLoadType } from '../note/note-load-types'
import { loadNoteFromType } from '../shared/storage'
import { load } from '../note/utils/file-format'
import type { MargedNoteData } from '../note/components/notes-utils'
import { Spinner } from '../note/components/utils/Spinner'

export const Navbar = () => {

}

export const InitialScreen = () => {
  return <div>
    aaa
  </div>
}

const LoadingNoteScreen = () => {
  return <div class="h-full grid place-items-center">
    <div class="flex justify-center items-center">
      <Spinner class="border-on-background"/>
      ノートを読み込み中...
    </div>
  </div>
}
export default (props: {
  noteLoadType: NoteLoadType
}) => {
  const [getNote, setNote] = createSignal<MargedNoteData[]>()
  const [getNoteLoadState, setNoteLoadState] = createSignal<'pending' | 'loaded' | 'error'>('pending')

  onMount(async () => {
    setNoteLoadState('pending')
    const loadedNoteFile = await loadNoteFromType(props.noteLoadType)
    if (!loadedNoteFile) {
      setNoteLoadState('error')
      return
    }
    
    const loadedNote = await load(new Blob([loadedNoteFile.nnote]))
    if (!loadedNote.success) {
      setNoteLoadState('error')
      return
    }

    setNote(loadedNote.notes)
    setNoteLoadState('loaded')
  })
  return <div class="h-full">
    <Show when={getNoteLoadState() === 'pending'}>
      <LoadingNoteScreen />
    </Show>
  </div>
}
