import { zipSync } from 'fflate'
import type { Note } from '../../components/notes-utils'
import { manifest0, type Manifest0 } from './manifest-schema'

interface FileTree {
  [path: string]: Uint8Array
}

const textEncoder = new TextEncoder()
export const json2uint8Array = (jsonData: unknown): Uint8Array => textEncoder.encode(JSON.stringify(jsonData))

export const save = (notes: Note[]): Blob => {
  const fileTree: FileTree = {}

  const manifest: Manifest0 = (() => {
    const noteIds: Manifest0['noteIds'] = notes.map(() => ({
      id: crypto.randomUUID()
    }))

    return {
      version: 0,
      noteIds
    }
  })()

  fileTree['manifest.json'] = json2uint8Array(manifest)

  const nnoteBuff = zipSync(fileTree)
  const nnoteFile = new Blob([nnoteBuff], {
    type: "application/x.nanohanote.nnote"
  })

  return nnoteFile
}

export const load = (data: Blob) => {}
