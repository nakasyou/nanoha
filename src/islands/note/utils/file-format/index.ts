import { type Unzipped, unzipSync, zip, zipSync } from 'fflate'
import { type InferOutput, parse } from 'valibot'
import type {
  MargedNoteData,
  Note,
  NoteData,
} from '../../components/notes-utils'
import { type Manifest0, type Note0, manifest0, note0 } from './manifest-schema'
interface FileTree {
  [path: string]: Uint8Array
}

const textEncoder = new TextEncoder()
export const json2uint8Array = (jsonData: unknown): Uint8Array =>
  textEncoder.encode(JSON.stringify(jsonData))

export const saveNoteDatas = async (noteDatas: NoteData[]): Promise<Blob> => {
  const fileTree: FileTree = {}

  const manifest: Manifest0 = (() => {
    const noteIds: Manifest0['noteIds'] = noteDatas.map((noteData) => ({
      id: noteData.id,
    }))

    return {
      version: 0,
      noteIds,
    }
  })()

  fileTree['notes.json'] = json2uint8Array(manifest)

  for (const [index, noteId] of Object.entries(manifest.noteIds)) {
    const thisNoteData = noteDatas[Number.parseInt(index)]
    if (!thisNoteData) {
      continue
    }
    const baseNoteDir = `notes/${noteId.id}`

    const blobMimetypes: Record<string, string> = {}
    for (const [name, blob] of Object.entries(thisNoteData.blobs)) {
      if (!blob) {
        continue
      }
      fileTree[`${baseNoteDir}/blobs/${name}`] = new Uint8Array(
        await blob.arrayBuffer(),
      )
      blobMimetypes[name] = blob.type
    }

    const noteJson: Note0 = (() => {
      return {
        version: 0,
        type: thisNoteData.type,
        blobMimetypes,

        noteData: thisNoteData.canToJsonData,

        timestamp: thisNoteData.timestamp,
      }
    })()
    fileTree[`${baseNoteDir}/note.json`] = textEncoder.encode(
      JSON.stringify(noteJson),
    )
  }
  const nnoteBuff = zipSync(fileTree)
  const nnoteFile = new Blob([nnoteBuff], {
    type: 'application/x.nanohanote.nnote',
  })

  return nnoteFile
}
export const save = async (notes: Note[]): Promise<Blob> => {
  return saveNoteDatas(notes.map((note) => note.noteData))
}

type LoadErrorType =
  | 'FILE_ISNT_ZIP'
  | 'NOTES_JSON_IS_NOT_FOUND'
  | 'INVALID_NOTES_JSON'
  | 'NOTE_DEFINE_FILE_IS_NOT_FOUND'
  | 'NOTE_DEFINE_FILE_IS_INVALID'
  | 'NOTE_BLOB_FILE_IS_NOT_FOUND'
export type LoadError = {
  type: LoadErrorType
  debug?: unknown
}
type LoadResult =
  | {
      success: true
      notes: MargedNoteData[]
    }
  | {
      success: false
      error: LoadError
    }

export const load = async (data: Blob): Promise<LoadResult> => {
  let unzipped: FileTree
  // 解凍
  try {
    unzipped = unzipSync(new Uint8Array(await data.arrayBuffer()))
  } catch (e) {
    return {
      success: false,
      error: { type: 'FILE_ISNT_ZIP' },
    }
  }
  const notesJson = unzipped['notes.json']
  if (!notesJson) {
    return {
      success: false,
      error: { type: 'NOTES_JSON_IS_NOT_FOUND' },
    }
  }

  let notesJsonData: InferOutput<typeof manifest0>
  try {
    notesJsonData = parse(
      manifest0,
      JSON.parse(new TextDecoder().decode(notesJson)),
    )
  } catch (e) {
    return {
      success: false,
      error: {
        type: 'INVALID_NOTES_JSON',
      },
    }
  }

  const newNoteDatas: MargedNoteData[] = []
  for (const { id } of notesJsonData.noteIds) {
    const noteFolder = `notes/${id}`
    const noteDefineJsonPath = `${noteFolder}/note.json`

    const noteDefineJsonBuff = unzipped[noteDefineJsonPath]
    if (!noteDefineJsonBuff) {
      return {
        success: false,
        error: {
          type: 'NOTE_DEFINE_FILE_IS_NOT_FOUND',
          debug: {
            onErrorNoteId: id,
          },
        },
      }
    }

    let noteDefineJsonData: Note0
    try {
      noteDefineJsonData = parse(
        note0,
        JSON.parse(new TextDecoder().decode(noteDefineJsonBuff)),
      )
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'NOTE_DEFINE_FILE_IS_INVALID',
          debug: {
            onErrorNoteId: id,
          },
        },
      }
    }
    const blobs: Record<string, Blob> = {}
    for (const [name, mime] of Object.entries(
      noteDefineJsonData.blobMimetypes,
    )) {
      const blobPath = `${noteFolder}/blobs/${name}`
      const blob = unzipped[blobPath]
      if (!blob) {
        return {
          success: false,
          error: {
            type: 'NOTE_BLOB_FILE_IS_NOT_FOUND',
          },
        }
      }
      blobs[name] = new Blob([blob], {
        type: mime,
      })
    }
    newNoteDatas.push({
      canToJsonData: noteDefineJsonData.noteData,
      blobs,
      type: noteDefineJsonData.type,
      id: id,
      timestamp: noteDefineJsonData.timestamp,
    } as MargedNoteData)
  }
  return {
    success: true,
    notes: newNoteDatas,
  }
}
