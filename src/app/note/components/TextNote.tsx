//    <TextNote mode={mode} isView={isView} />
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TipTapPluginNanoha } from "../utils/tiptap-plugin-nanoha.ts"
import {
  IconNote,
  IconNoteOff,
  IconBold,
  IconBoldOff,
} from '@tabler/icons-react'
import {
  useRef,
  useEffect,
} from "react"
import classNames from "classnames"
export interface Props {
  mode: "edit" | "play"
  isView: boolean
}
export default (props: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapPluginNanoha,
    ],
    content: '<p>TextNote</p>',
  })
  useEffect(() => {
    for (const nanohaSheetElement of (viewEditorRef?.current?.getElementsByClassName("nanoha-sheet") || [])) {
      nanohaSheetElement.dataset.isview = props.isView
      nanohaSheetElement?.onresetsheet()
    }
  }, [props.isView])
  const viewEditorRef = useRef(null)
  useEffect(() => {
    for (const nanohaSheetElement of (viewEditorRef?.current?.getElementsByClassName("nanoha-sheet") || [])) {
      nanohaSheetElement.dataset.isview = "true"
      nanohaSheetElement.style = ""
      const getIsView = (): boolean => (nanohaSheetElement.dataset.isview === "true")
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
      <div class="mx-10">
          <div className={classNames({ hidden: props.mode === "play" })}>
              {/* Edit Mode */}
              <div class="p-4 rounded-md border">
                <EditorContent editor={editor} />
              </div>
              <div>
                {/* コントロールパネル */}
                <div class="flex justify-center items-center">
                  <button class="p-2 rounded-full border" onClick={() => {
                    editor?.chain().focus().toggleSheet().run()
                  }}>
                    <IconNote />
                  </button>
                 <button class="p-2 rounded-full border" onClick={() => {
                    editor?.chain().focus().toggleBold().run()
                  }}>
                    {editor?.isActive('bold') ? <IconBold /> : <IconBoldOff />}
                  </button>
                  {editor?.isActive('bold') ? 'active' : 'nonactive'}
                </div>
              </div>
             </div>
            <div className={classNames({ hidden: props.mode === "edit" })}>
               {/* View Mode */}
              <div class="p-4 rounded-md border">
                <div ref={viewEditorRef} dangerouslySetInnerHTML={{
                  __html: editor?.getHTML()
                }}/>
              </div>
            </div>
      </div>
    </>
  )
}
