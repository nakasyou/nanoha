import Dexie from 'dexie'
import type { QuizContent } from './constants'

export interface Quizzes {
  id?: number

  /** ノートの ID */
  noteId: number
  /** ノートの中のノートの ID */
  noteDataId: string
  /** ノートの SHA256 */
  noteHash: string

  /** 問題 */
  content: QuizContent

  /** 何回出題した？ */
  proposeCount: number
  /** 何回正解した？ */
  correctCount: number
}

export class QuizDB extends Dexie {
  quizzes: Dexie.Table<Quizzes, number>
  constructor() {
    super('quizzes')

    this.version(1).stores({
      quizzes:
        'id++, noteId, noteDataId, noteHash, content, proposeCount, correctCount',
    })

    this.quizzes = this.table('quizzes')
  }
}
