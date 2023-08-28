//    <TextNote mode={mode} isView={isView} />
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { Editor } from "@tiptap/core"
import { TipTapPluginSheet } from "../utils/tiptap-plugin-sheet"
import { TiptapPluginImageNote } from "../utils/tiptap-plugin-imagenote"
import { UserStateContext, NoteIndexContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'
import { classListAddAll, classListRemoveAll } from "../utils/classListAll.ts"
import {
  IconBold,
  IconBoldOff,
  IconNote,
  IconNoteOff,
  IconX,
} from "@tabler/icons-react"
import { useEffect, useRef, useContext } from "react"
import classNames from "classnames"

export interface Props {
  defaultContent: string
  setEditorState: (editor: Editor | null) => void
  index: number
  onRemove: (index: number) => void
}
export default (props: Props) => {
  const userState = useContext(UserStateContext)
  const noteIndex = useContext(NoteIndexContext)
  
  const editor = useEditor({
    extensions: [StarterKit, TipTapPluginSheet, TiptapPluginImageNote],
    content: props.defaultContent,
  })
  props.setEditorState(editor)

  const viewEditorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    for (const nanohaSheetElement of viewEditorRef?.current?.getElementsByClassName(
      "nanoha-sheet"
    ) || []) {
      nanohaSheetElement.dataset.isview = userState.isView
      nanohaSheetElement?.onresetsheet()
    }
  }, [userState.isView])
  useEffect(() => {
    for (const nanohaSheetElement of viewEditorRef?.current?.getElementsByClassName(
      "nanoha-sheet"
    ) || []) {
      nanohaSheetElement.dataset.isview = "true"
      nanohaSheetElement.style = ""
      nanohaSheetElement.classList.add("select-none")
      const getIsView = (): boolean =>
        nanohaSheetElement.dataset.isview === "true"
      const reset = () => {
        if (getIsView()) {
          classListAddAll(nanohaSheetElement, viewClasses)
          classListRemoveAll(nanohaSheetElement, hideClasses)
        } else {
          classListRemoveAll(nanohaSheetElement, viewClasses)
          classListAddAll(nanohaSheetElement, hideClasses)
        }
      }
      reset()
      nanohaSheetElement.onclick = () => {
        nanohaSheetElement.dataset.isview = !getIsView()
        const isView = getIsView()
        reset()
      }
      nanohaSheetElement.onresetsheet = () => reset()
    }
  }, [userState.mode])
  
  return (
    <>
      { noteIndex }
      <div className="mx-4">
        <div className={classNames({ hidden: userState.mode === "play" })}>
          {/* Edit Mode */}
          <div className="p-4 rounded-md border">
            <EditorContent editor={editor} />
          </div>
          <div>
            {/* コントロールパネル */}
            <div className="flex justify-center items-center">
              <button
                className="p-2 rounded-full border"
                onClick={() => {
                  editor?.chain().focus().toggleSheet().run()
                }}
              >
                {editor?.isActive("sheet") ? <IconNote /> : <IconNoteOff />}
              </button>
              <button
                className="p-2 rounded-full border"
                onClick={() => {
                  editor?.chain().focus().toggleBold().run()
                }}
              >
                {editor?.isActive("bold") ? <IconBold /> : <IconBoldOff />}
              </button>
              <button
                className="p-2 rounded-full border"
                onClick={() => {
                  props.onRemove(noteIndex)
                }}
              >
                <IconX />
              </button>
            </div>
          </div>
        </div>
        <div className={classNames({ hidden: userState.mode === "edit" })}>
          {/* View Mode */}
          <div className="p-4 rounded-md border">
            <div
              ref={viewEditorRef}
              dangerouslySetInnerHTML={{
                __html: editor?.getHTML() as string,
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
