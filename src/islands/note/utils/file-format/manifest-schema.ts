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
  pipe,
  number,
  optional,
  type InferOutput,
} from 'valibot'

/**
 * Manifest Version 0
 */
export const manifest0 = object({
  version: literal(0),

  noteIds: array(
    object({
      id: pipe(string(), uuid()),
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

  // If undefined, fallback 0
  timestamp: optional(number(), 0),
})
export type Note0 = InferOutput<typeof note0>
