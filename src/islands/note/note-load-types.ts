export type NoteLoadType = FromLocal | Unknown

interface FromLocal {
  from: 'local'
  id: number
}
interface Unknown {
  from: 'unknown'
}
