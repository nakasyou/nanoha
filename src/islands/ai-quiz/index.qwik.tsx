/** @jsxImportSource @builder.io/qwik */

import { component$, useContextProvider, useStore } from '@builder.io/qwik'
import {
  type ScreenState,
  type Settings,
  SCREEN_STATE_CTX,
  SETTINGS_CTX,
} from './store'
import { InitialScreen } from './components/InitialScreen.qwik'
import type { NoteLoadType } from '../note/note-load-types'
import { QuizScreen } from './components/Quiz.qwik'
import { Navbar } from './components/Navbar.qwik'

export default component$<{
  noteLoadType: NoteLoadType
}>((props) => {
  const screenState = useStore<ScreenState>({
    note: 'pending',
    started: false,

    availableAI: null,
    noteLoadType: props.noteLoadType,

    rangeNotes: new Set(),

    lastMissedQuizIds: [],
  })
  useContextProvider(SCREEN_STATE_CTX, screenState)

  const settings = useStore<Settings>({
    quizzesByRound: 5,
    lowRateQuizzesInRound: 1,
  })
  useContextProvider(SETTINGS_CTX, settings)

  return (
    <div class="flex flex-col h-dvh lg:flex-row w-full">
      <div class="lg:h-dvh lg:border-r border-b lg:border-b-0 border-r-0">
        <Navbar />
      </div>
      <div class="px-2 w-full pb-5 h-dvh overflow-y-auto grow">
        {screenState.started ? <QuizScreen /> : <InitialScreen />}
      </div>
    </div>
  )
})
