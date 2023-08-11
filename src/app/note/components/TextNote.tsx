//    <TextNote mode={mode} isView={isView} />
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TipTapPluginSheet } from "../utils/tiptap-plugin-sheet.js"
import {
  IconBold,
  IconBoldOff,
  IconNote,
  IconNoteOff,
} from "@tabler/icons-react"
import { useEffect, useRef } from "react"
import classNames from "classnames"
export interface Props {
  mode: "edit" | "play"
  isView: boolean
  defaultContent: string
}
export default (props: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, TipTapPluginSheet],
    content: props.defaultContent,
  })
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
      const reset = () => {
        if (getIsView()) {
          nanohaSheetElement.classList.add("bg-red-100")
          nanohaSheetElement.classList.remove("bg-red-500")
          nanohaSheetElement.classList.remove("text-transparent")
        } else {
          nanohaSheetElement.classList.remove("bg-red-100")
          nanohaSheetElement.classList.add("bg-red-500")
          nanohaSheetElement.classList.add("text-transparent")
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
  }, [props.mode])
  return (
    <>
      <div className="mx-10">
        <div className={classNames({ hidden: props.mode === "play" })}>
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
        <div className={classNames({ hidden: props.mode === "edit" })}>
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