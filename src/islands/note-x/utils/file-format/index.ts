import { zipSync, zip } from 'fflate'
import type { Note } from '../../components/notes-utils'
import { manifest0, type Manifest0, type Note0 } from './manifest-schema'

interface FileTree {
  [path: string]: Uint8Array
}

const textEncoder = new TextEncoder()
export const json2uint8Array = (jsonData: unknown): Uint8Array => textEncoder.encode(JSON.stringify(jsonData))

export const save = async (notes: Note[]): Promise<Blob> => {
  const fileTree: FileTree = {}

  const manifest: Manifest0 = (() => {
    const noteIds: Manifest0['noteIds'] = notes.map(() => ({
      id: crypto.randomUUID()
    }))

    return {
      version: 0,
      noteIds,
    }
  })()

  fileTree['manifest.json'] = json2uint8Array(manifest)

  for (const [index, noteId] of Object.entries(manifest.noteIds)) {
    const thisNote = notes[parseInt(index)]
    const baseNoteDir = `notes/${noteId}`

    const blobMimeTypes: []
    for (const [name, blob] of Object.entries(thisNote.noteData.blobs)) {
      fileTree[`${baseNoteDir}/${blob}`] = new Uint8Array(await blob.arrayBuffer())
    }

    const noteJson: Note0 = (() => {
      return {
        version: 0,
        type: thisNote.noteData.type
      }
    })()
    fileTree[`${baseNoteDir}/notes.json`] = textEncoder.encode(JSON.stringify(noteJson))
  }
  const nnoteBuff = zipSync(fileTree)
  const nnoteFile = new Blob([nnoteBuff], {
    type: "application/x.nanohanote.nnote"
  })

  return nnoteFile
}

export const load = (data: Blob) => {}
