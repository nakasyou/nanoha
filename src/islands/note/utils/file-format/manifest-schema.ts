import {
  object,
  literal,
  array,
  string,
  uuid,
  type InferInput,
  union,
  record,
  unknown,
  pipe
} from 'valibot'

/**
 * Manifest Version 0
 */
export const manifest0 = object({
  version: literal(0),

  noteIds: array(
    object({
      id: pipe(string(), uuid())
    }),
  ),
})
export type Manifest0 = InferInput<typeof manifest0>

/**
 * Note Version 0
 */
export const note0 = object({
  version: literal(0),

  type: union([literal('text'), literal('image')]),

  blobMimetypes: record(string(), string()),

  noteData: unknown(),
})
export type Note0 = InferInput<typeof note0>
