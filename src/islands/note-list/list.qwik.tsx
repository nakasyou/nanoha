/** @jsxImportSource @builder.io/qwik */
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { NotesDB, type Notes } from '../note/notes-schema'

export const NoteList = component$(() => {
  const notes = useSignal<Notes[] | null>(null)
  let db = null //useSignal<NotesDB | null>(null)

  useVisibleTask$(() => {
    const notesDB = new NotesDB()
    db = notesDB
    ;(async () => {
      notes.value = await notesDB.notes.toArray()
    })()
  })
  return (
    <div>
      {notes.value ? (
        notes.value.length === 0 ? (
          <div>ノートがありません</div>
        ) : (
          <div>
            {notes.value.map((note) => (
              <div class="border p-2 bg-surface rounded border-outline">
                <a href={`/app/notes/local-${note.id}`}>
                  <div class="text-lg">{note.name}</div>
                </a>
                <div>
                  <div>
                    Last Updated:{' '}
                    {new Intl.DateTimeFormat('ja-jp', {
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric'
                    }).format(note.updated)}
                  </div>
                </div>
                <div class="text-right">
                  <button
                    class="underline hover:no-underline"
                    onClick$={async (e) => {
                      /*e.preventDefault()
                    if (!confirm(`ノート「${note.name}」を削除しますか？`)) {
                      return
                    }
                    await db.notes.delete(note.id!)
                    props.update()*/
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>読み込み中...</div>
      )}
    </div>
  )
})
