import { object, literal, array, string, uuid, type Input } from 'valibot'

/**
 * Manifest Version 0
 */
export const manifest0 = object({
  version: literal(0),

  noteIds: array(object({
    id: string([uuid()])
  }))
})
export type Manifest0 = Input<typeof manifest0>
