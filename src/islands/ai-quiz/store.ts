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
}

export interface QuizState {
  correctQuizzes: Quiz[]
  incorrectQuizzes: Quiz[]

  generatedQuizzes: number

  quizzes: Quiz[]

  current: {
    index: number
    quiz: Quiz
    choices: string[]
  } | null

  goalQuestions: number

  isFinished: boolean

  finishedQuizIndexes: Set<number>
}

export interface Settings {
  quizzes: number
}

export const SCREEN_STATE_CTX = createContextId<ScreenState>('screenState')
export const QUIZ_STATE_CTX = createContextId<QuizState>('quizState')
export const SETTINGS_CTX = createContextId<Settings>('settings')
