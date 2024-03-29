import { object, literal, array, string, uuid, type Input, union, record, unknown } from 'valibot'

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

/**
 * Note Version 0
 */
export const note0 = object({
  version: literal(0),

  type: union([
    literal('text'),
    literal('image')
  ]),

  blobMimetypes: record(string(), string()),

  noteData: unknown()
})
export type Note0 = Input<typeof note0>
