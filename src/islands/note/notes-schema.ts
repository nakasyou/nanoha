import Dexie from 'dexie'

export interface Notes {
  id?: number
  name: string
  nnote: Uint8Array
  updated: Date
}

export class NotesDB extends Dexie {
  notes: Dexie.Table<Notes, number>
  constructor() {
    super('notes') // データベース名をsuperのコンストラクタに渡す

    this.version(1).stores({
      notes: '++id, name, nnote, updated'
    })

    this.notes = this.table('notes')
  }
}
