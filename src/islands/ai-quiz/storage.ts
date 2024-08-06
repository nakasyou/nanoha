import Dexie from 'dexie'
import type { QuizContent } from './constants'

type SerializedQuiz = {
  type: 'select'
} & QuizContent

export interface QuizzesByNote {
  id?: number

  targetNotebook: string

  quiz: SerializedQuiz

  rateSource: {
    /**
     * 正答数
     */
    correct: number
    /**
     * 出題数
     */
    total: number
  }

  rate: number

  noteId: string
}

export class QuizDB extends Dexie {
  quizzesByNote: Dexie.Table<QuizzesByNote, number>
  constructor() {
    super('quizzesByNote')
    
    this.version(1).stores({
      quizzesByNote: 'id++, targetNotebook, noteId, quiz, rateSource, rate',
    })

    this.quizzesByNote = this.table('quizzesByNote')
  }
}
