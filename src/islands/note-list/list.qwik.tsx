/** @jsxImportSource @builder.io/qwik */
import { $, component$, useOnDocument, useSignal, useVisibleTask$, type QRL } from '@builder.io/qwik'
import { NotesDB, type Notes } from '../note/notes-schema'
import classnames from 'classnames'

const NoteListItem = component$<{
  note: Notes
  update: QRL<() => Promise<void>>
}>((props) => {
  return <div class="border bg-surface rounded border-outline p-2">
    <a href={`/app/notes/local-${props.note.id}`}>
      <div class='text-lg'>{props.note.name}</div>
    </a>
    <div>
      <div class='text-sm'>
        最終更新:{' '}
        {new Intl.DateTimeFormat('ja-jp', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        }).format(props.note.updated)}
      </div>
    </div>
    <div class="text-right">
      <button
        class="underline hover:no-underline"
        onClick$={async (e) => {
          e.preventDefault()
          if (!confirm(`ノート「${props.note.name}」を削除しますか？`)) {
            return
          }
          await new NotesDB().notes.delete(props.note.id!)
          props.update()
        }}
      >
        削除
      </button>
    </div>
  </div>
})

export const NoteList = component$((props) => {
  const notes = useSignal<Notes[] | null>(null)

  const sortMode = useSignal<'updated' | 'name'>('updated')
  const isShownSortModeDialog = useSignal(false)
  const isStartedSortModeDialog = useSignal(false)

  const update = $(async () => {
    notes.value = null
    const notesDB = new NotesDB()
    notesDB
    notes.value = await notesDB.notes.toArray()
  })

  const loaded = $(() => {
    update()
  })
  useOnDocument('load', loaded)
  useOnDocument('astro:page-load', loaded)
  return (
    <div>
      <div class='py-2'>
        <button onClick$={() => {
          isShownSortModeDialog.value = true
          setTimeout(() => {
            isStartedSortModeDialog.value = true
          }, 50)
        }} class='text-on-surface-variant'>{{
          updated: '最終更新日',
          name: '名前'
        }[sortMode.value]}</button>
      </div>
      <div class='px-1'>
        {notes.value ? (
          notes.value.length === 0 ? (
            <div>ノートがありません</div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notes.value.map((note) => <NoteListItem note={note} update={update} />)}
            </div>
          )
        ) : (
          <div>読み込み中...</div>
        )}
      </div>

      <div class={classnames([
        'fixed top-0 left-0 w-full h-[100dvh] bg-[#000a] z-20',
        { 'hidden': !isShownSortModeDialog.value }
      ])} onClick$={() => {
        isStartedSortModeDialog.value = false
        setTimeout(() => {
          isShownSortModeDialog.value = false
        }, 50)
      }}>
        <div class={classnames([
          'transition-transform duration-150 w-1/2 h-full rounded-l-3xl bg-background p-4',
          isStartedSortModeDialog.value ? 'translate-x-full' : 'translate-x-[200%]'
        ])} onClick$={(evt) => {
          evt.stopPropagation()
        }}>
          <div class='text-2xl'>Sorting</div>
          <div class='grid grid-rows-2 rounded-xl border border-outlined'>
            <button>最終更新</button>
            <button>名前</button>
          </div>
        </div>
      </div>
    </div>
  )
})
