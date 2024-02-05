import { For, Suspense, lazy, onMount } from 'solid-js'
import { NotesDB } from '../note/notes-schema'


export const NoteListLoader = lazy(async () => {
  const db = new NotesDB()

  const allNotes = await db.notes.toArray()

  return {
    default: () => <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <For each={allNotes}>{(note) => {
        return <a href={`/app/notes/local-${note.id}`}><div class="border p-2 bg-surface rounded border-outline">
          <div class="text-lg">{ note.name }</div>
          <div>
            <div>Last Updated: {note.updated.toString()}</div>
          </div>
        </div></a>
      }}</For>
    </div>
  }
})
export const NoteList = () => {
  return <Suspense fallback={<div>Loading...</div>}>
    <NoteListLoader />
  </Suspense>
}
