/** @jsxImportSource @builder.io/qwik */
import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { NotesDB, type Notes } from '../note/notes-schema'

export const NoteList = component$((props) => {
  const notes = useSignal<Notes[] | null>(null)

  const update = $(async () => {
    notes.value = null
    const notesDB = new NotesDB()
    notes.value = await notesDB.notes.toArray()
  })

  useVisibleTask$(() => {
    update()
  })
  return (
    <div>
      {notes.value ? (
        notes.value.length === 0 ? (
          <div>ノートがありません</div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notes.value.map((note) => (
              <div class="border bg-surface rounded border-outline p-2">
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
                      e.preventDefault()
                      if (!confirm(`ノート「${note.name}」を削除しますか？`)) {
                        return
                      }
                      await new NotesDB().notes.delete(note.id!)
                      update()
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
