/** @jsxImportSource @builder.io/qwik */
import { component$, useContext, useSignal } from '@builder.io/qwik'
import { icon } from '../../../utils/icons'
import { SCREEN_STATE_CTX, SETTINGS_CTX } from '../store'

const Settings = component$<{
  onClose$: () => void
}>((props) => {
  const screenState = useContext(SCREEN_STATE_CTX)
  const settings = useContext(SETTINGS_CTX)

  return (
    <div class="w-full h-dvh fixed z-20 top-0 left-0 bg-[#000a] grid items-center p-3">
      <div class="bg-surface rounded-lg p-2 border border-outline">
        <div class="text-2xl font-bold">設定</div>
        <hr />
        <div>
          <div class="text-xl">出題範囲</div>
          <div class="border-l-2 pl-2 ml-2 max-h-32 overflow-y-auto">
            {typeof screenState.note === 'string' ? (
              '読み込み中'
            ) : (
              <div>
                {screenState.note!.notes.map((note) => {
                  const text =
                    new DOMParser().parseFromString(
                      note.canToJsonData.html,
                      'text/html',
                    ).documentElement.textContent ?? '空のノート'
                  return (
                    <label key={note.id}>
                      <div class="flex gap-2">
                        <input
                          type="checkbox"
                          checked={screenState.rangeNotes.has(note.id)}
                          onChange$={(evt) => {
                            const target = evt.target as HTMLInputElement
                            const set = new Set(screenState.rangeNotes)
                            if (target.checked) {
                              set.add(note.id)
                            } else {
                              set.delete(note.id)
                            }
                            screenState.rangeNotes = set
                          }}
                        />
                        <div>
                          {text?.length > 20
                            ? `${text.substring(0, 20)}...`
                            : text}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div>
          <button
            class="filled-button"
            type="button"
            onClick$={() => {
              props.onClose$()
              if (screenState.started) {
                screenState.started = false
              }
            }}
          >
            {screenState.started ? '保存してもう一度' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
})

/**
 * Navbar
 */
export const Navbar = component$(() => {
  const isSettingsOpened = useSignal(false)
  return (
    <>
      {isSettingsOpened.value && (
        <Settings
          onClose$={() => {
            isSettingsOpened.value = false
          }}
        />
      )}
      <div class="flex flex-row lg:flex-col justify-between h-full w-full">
        <a class="w-8 h-8" href=".">
          <div dangerouslySetInnerHTML={icon('arrowLeft')} class="w-8 h-8" />
        </a>
        <button
          onClick$={() => {
            isSettingsOpened.value = !isSettingsOpened.value
          }}
          type="button"
          dangerouslySetInnerHTML={icon('settings')}
          class="w-8 h-8"
        />
      </div>
    </>
  )
})
