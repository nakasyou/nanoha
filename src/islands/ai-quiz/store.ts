import { createContextId, type NoSerialize } from '@builder.io/qwik'
import type { QuizContent } from './constants'
import type { NoteLoadType } from '../note/note-load-types'
import type { TextNoteData } from '../note/components/notes/TextNote/types'

/**
 * クイズ
 */
export interface Quiz {
  content: QuizContent

  source: TextNoteData

  id: number
}

export interface ScreenState {
  note:
    | NoSerialize<{
        name: string
        notes: TextNoteData[]
      }>
    | 'pending'
    | 'notfound'
    | 'invalid'

  started: boolean

  availableAI: boolean | null

  noteLoadType: NoteLoadType

  /**
   * 出題範囲
   */
  rangeNotes: Set<string>

  lastMissedQuizIds: number[]
}

export type QuizFrom = 'generated' | 'missed' | 'lowRate'
export type QuizState = {
  correctQuizzes: Quiz[]
  incorrectQuizzes: Quiz[]

  generatedQuizzes: number

  quizzes: {
    quiz: Quiz
    from: QuizFrom
  }[]

  current: {
    index: number
    quiz: Quiz
    choices: string[]
    from: QuizFrom
  } | null

  isFinished: boolean

  finishedQuizIndexes: Set<number>

  lastMissedQuizzes: number
}

export interface Settings {
  quizzesByRound: number
  lowRateQuizzesInRound: number
}

export const SCREEN_STATE_CTX = createContextId<ScreenState>('screenState')
export const QUIZ_STATE_CTX = createContextId<QuizState>('quizState')
export const SETTINGS_CTX = createContextId<Settings>('settings')
