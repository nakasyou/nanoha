//    <TextNote mode={mode} isView={isView} />
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import type { Editor } from "@tiptap/core"
import { TipTapPluginSheet } from "../utils/tiptap-plugin-sheet"
import { TiptapPluginImageNote } from "../utils/tiptap-plugin-imagenote"
import { ModeContext } from "../index.tsx"

import {
  IconBold,
  IconBoldOff,
  IconNote,
  IconNoteOff,
} from "@tabler/icons-react"
import { useEffect, useRef, useContext } from "react"
import classNames from "classnames"

export interface Props {
  mode: "edit" | "play"
  isView: boolean
  defaultContent: string
  setEditorState: (editor: Editor | null) => void
}
export default (props: Props) => {
  const modeData = useContext(ModeContext)
  
  const editor = useEditor({
    extensions: [StarterKit, TipTapPluginSheet, TiptapPluginImageNote],
    content: props.defaultContent,
  })
  props.setEditorState(editor)
  const classListAddAll = (element: Element, classes: string[]) => {
    for (const className of classes) {
      element.classList.add(className)
    }
  }
  const classListRemoveAll = (element: Element, classes: string[]) => {
    for (const className of classes) {
      element.classList.remove(className)
    }
  }
  const viewEditorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    for (const nanohaSheetElement of viewEditorRef?.current?.getElementsByClassName(
      "nanoha-sheet"
    ) || []) {
      nanohaSheetElement.dataset.isview = props.isView
      nanohaSheetElement?.onresetsheet()
    }
  }, [props.isView])
  useEffect(() => {
    for (const nanohaSheetElement of viewEditorRef?.current?.getElementsByClassName(
      "nanoha-sheet"
    ) || []) {
      nanohaSheetElement.dataset.isview = "true"
      nanohaSheetElement.style = ""
      nanohaSheetElement.classList.add("select-none")
      const getIsView = (): boolean =>
        nanohaSheetElement.dataset.isview === "true"
      const viewClasses = ['bg-red-100']
      const hideClasses = ['bg-red-500', 'text-transparent']
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
  }, [modeData])
  
  return (
    <>
      <div className="mx-10">
        <div className={classNames({ hidden: modeData === "play" })}>
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
            </div>
          </div>
        </div>
        <div className={classNames({ hidden: modeData === "edit" })}>
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
