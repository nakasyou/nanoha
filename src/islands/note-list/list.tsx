import { For, Suspense, lazy, onMount } from 'solid-js'
import { NotesDB } from '../note/notes-schema'


const NoteListLoader = lazy(async () => {
  const db = new NotesDB()

  const allNotes = await db.notes.toArray()

  return {
    default: (props: { update (): void }) => <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <For each={allNotes}>{(note) => {
        return <div class="border p-2 bg-surface rounded border-outline">
          <a href={`/app/notes/local-${note.id}`}><div class="text-lg">{ note.name }</div></a>
          <div>
            <div>Last Updated: {new Intl.DateTimeFormat('ja-jp', {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              day: 'numeric',
              month: 'numeric',
              year: 'numeric'
            }).format(note.updated)}</div>
          </div>
          <div class="text-right">
            <button
              class="underline hover:no-underline"
              onClick={async (e) => {
                e.preventDefault()
                if (!confirm(`ノート「${note.name}」を削除しますか？`)) {
                  return
                }
                await db.notes.delete(note.id!)
                props.update()
              }}>削除</button>
          </div>
        </div>
      }}</For>
    </div>
  }
})
export const NoteList = () => {
  return <Suspense fallback={<div>Loading...</div>}>
    <NoteListLoader update={() => {
      location.reload()
    }}/>
  </Suspense>
}
