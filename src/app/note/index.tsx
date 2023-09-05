import TextNote from "./components/TextNote.tsx"
import {
  IconPlayerPlay,
  IconEdit,
  IconEye,
  IconPlus,
  IconScan,
  IconX,
  IconPencil,
  IconArrowNarrowUp,
  IconArrowNarrowDown,
  IconMenu2,
} from "@tabler/icons-react"
import { useEffect, useState, createContext } from "react"
import classnames from "classnames"
import ScanDialog from "./components/ScanDialog.tsx"
import ImageNote from './components/ImageNote.tsx'
import type { Editor } from "@tiptap/react"
import { arrayMoveImmutable } from 'array-move'
import * as fflate from 'fflate'

export interface Props {
  
}
export const UserStateContext = createContext<{
  mode: "edit" | "play",
  isView: boolean
}>({
  mode: 'edit',
  isView: true,
})
export const NoteIndexContext = createContext(0)

type NoteData = [{
  data: any
  blobs: Record<string, Blob>
}]
export default function(props: Props){
  const [mode, setMode] = useState<"edit" | "play">("edit")
  const [isView, setIsView] = useState(false)
  
  const [plusFubActive, setPlusFubActive] = useState(false)
  const [isScanActive, setIsScanActive] = useState(false)

  const [editor, setEditor] = useState<Editor | null>(null)
  
  const [isMenuActive, setIsMenuActive] = useState(false)
  
  const [noteElements, setNoteElements] = useState<{
    element: JSX.Element
    key: any
    data: NoteData
    type: 'text' | 'image'
  }[]>([])
  
  const createTextNote = (defaultContent: string) => {
    const data = [{
      data: {},
      blobs: []
    }]
    setNoteElements([
      ...noteElements,
      {
        element: <TextNote
          defaultContent={defaultContent}
          setEditorState={(editor) => null}
          data={data}
         />,
         key: Math.random(),
         data,
         type: 'text',
      }
    ])
  }
  useEffect(() => {
    createTextNote(`<p>こんにちは！これはNanohaNoteです！</p>
        <p>NanohaNoteは、「じぶん」で作る、学習用ノートブックです！</p>
        <p>暗記をスムーズに行えます。</p>
        <p>例えば、こんなことができちゃいます:</p>
        <p>「Scratchでプログラミングするように、視覚的にプログラミングすることを、<span data-nanohasheet="true">ビジュアルプログラミング</span>という」</p>
        <p>じゃーん。すごいでしょ。<b>こんなふうに太字</b>にしたり、<del>証拠隠滅</del>したりできます。</p>
        <p>さあ、あなたの思いのままのノートにしましょう！この説明を消してもいいですよ〜</p>`)
    console.log(
      "%cここにコピペしろ",
      "font-size: 4em; color: red; font-weight: bold;",
    )
    console.log(
      "%cはすべて詐欺です",
      "font-size: 4em; color: red; font-weight: bold;",
      "\nここは開発者がウェブサイトを詳しく調べる場所です。ここに貼り付けることで、情報が抜き取られたりするかもしれません。"
    )
  }, [])
  return <>
    <div>
      { isScanActive && <ScanDialog onClose={(data) => {
        if (!data.failed) {
          const noteData: NoteData = [{
            data: {},
            blobs: {}
          }]
          setNoteElements([...noteElements, {
            element: <ImageNote
              imageBlob={data.imageBlob}
              paths={data.paths}
              sheetSvgPaths={data.sheetSvgPaths}
              data={noteData}
              />,
            key: Math.random(),
            data: noteData,
            type: 'image',
          }])
        }
        setIsScanActive(false)
      }} /> }
    </div>
    <div>
      {
        isMenuActive && <div className='w-screen h-screen fixed top-0 bottom-0 bg-background text-on+background z-20'>
          <div className='flex justify-between items-center mx-5'>
            <div className='text-2xl'>Menu</div>
            <button>
              <IconX />
            </button>
          </div>
          <div className='flex flex-wrap justify-center'>
            <button className='outlined-button my-2' onClick={async () => {
            try {
              const rotate = a => a[0].map((_, c) => a.map(r => r[c])).reverse();
          
              const [blobDatasArr, objectData] = rotate(noteElements.map((noteElement, index) => {
                const thisNoteData = noteElement.data[0]
                const rawObject = thisNoteData.data
                const blobs = Object.fromEntries(Object.entries(thisNoteData.blobs).map(([key, blob]) => ['blobs/' + index + '/' + key, blob]))

                const serializeData: string = {
                  data: rawObject,
                  type: noteElement.type,
                }

                return [serializeData, blobs]
              }))
              const blobDatas = Object.fromEntries(await Promise.all(Object.entries(Object.assign(...blobDatasArr)).map(async ([path, blob]) => {
                const buff = await blob.arrayBuffer()
                return [path, new Uint8Array(buff)]
              })))
              
              const filesData = {
                'note.json': new TextEncoder().encode(JSON.stringify({
                  notes: objectData,
                })),
                ...blobDatas,
              }
          
              const noteFile = fflate.zipSync(filesData)
              const noteFileBlob = new Blob([noteFile], {
                type: 'application/x.nanohanote.nnote'
              })
              const url = URL.createObjectURL(noteFileBlob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'note.nnote'
              a.click()
            } catch(e) {
              alert(e)
            }
            }}>保存する</button>
            <button className='outlined-button my-2' onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.oninput = async (evt) => {
                const file = evt.target.files[0]
                const buff = await file.arrayBuffer()
                const uint8array = new Uint8Array(buff)

                let files
                try {
                  files = await fflate.unzipSync(uint8array)
                } catch (_error) {
                  alert('ファイルの解凍に失敗しました。おそらくファイルの形式が違います。')
                }
                
                const noteData = JSON.parse(new TextDecoder().decode(files['note.json']))
                setNoteElements([])
                for (const note of noteData.notes) {
                  switch (note.type) {
                    case 'text': {
                      createTextNote(note.data)
                      break
                    }
                    default:
                  }
                }
              }
              input.click()
            }}>読み込む</button> 
          </div>
        </div>
      }
    </div>
    <div className="bg-background text-on-background min-h-screen">
      <div className="p-4 flex gap-4 flex-col">
          { (noteElements.length === 0) && <div className="text-center">
            <div className="text-2xl">ここにはノートが一つもありません</div>
            <div className="text-xl">右下の+を押して、ノートを追加しましょう!</div>
          </div>}
        
        <UserStateContext.Provider value={{
          mode,
          isView,
        }}>
            {
              noteElements.map((noteElement, index) => {
                return (
                    <div key={noteElement.key} className=''>
                    <div className='text-right'>
                      <button
                        className="p-2 rounded-full border"
                        onClick={() => {
                          setNoteElements(arrayMoveImmutable(noteElements, index, index - 1))
                        }}
                      ><IconArrowNarrowUp /></button>
                      <button
                        className="p-2 rounded-full border"
                        onClick={() => {
                          setNoteElements(arrayMoveImmutable(noteElements, index, index+1))
                        }}
                      ><IconArrowNarrowDown /></button>
                      <button
                        className="p-2 rounded-full border"
                        onClick={() => {
                          if (window.confirm('削除しますか?')){
                            setNoteElements(noteElements.filter((_v, eachIndex) => index !== eachIndex))
                          }
                        }}
                      >
                        <IconX />
                      </button>
                    </div>
                    { noteElement.element }
                  </div>
                  )
              })
            }
        </UserStateContext.Provider>
      </div>
      <div className="h-24" />
      <div className="fixed bottom-0 w-full bg-secondary-container h-24">
        {/* Navbar */}
        <div className="flex gap-4 justify-center items-center m-2">
          <div className="flex justify-center items-center bg-surface text-on-surface rounded-full">
            <button onClick={()=>setMode("edit")} className={classnames("p-4 rounded-full", { "bg-secondary text-on-secondary": mode === "edit" })}>
              <IconEdit />
            </button>
            <button onClick={()=>setMode("play")} className={classnames("p-4 rounded-full", { "bg-secondary text-on-secondary": mode === "play" })}>
              <IconPlayerPlay />
            </button>
          </div>
          <button onClick={() => setIsMenuActive(true)} className="filled-button ">
            <IconMenu2 />
          </button>
        </div>
      </div>
      <div className="fixed bottom-10 right-4">
        {/* 重要ボタンとか言うやつ */}
        { mode === "play" && <div className="flex justify-center items-center gap-2">
          <button className="fab" onClick={()=>setIsView(!isView)}>
            <IconEye />
          </button>
        </div> }

        { mode === "edit" && <>
          <div className="flex justify-center items-center gap-2 flex-col">
            {
              plusFubActive && <>
                <button className="small-fab flex justify-center items-center" onClick={() => setPlusFubActive(false)}>
                  <IconX />
                </button>
                <button className="small-fab flex justify-center items-center" onClick={() => {
                  createTextNote("New Note")
                }}>
                  <IconPencil />
                </button>
                <button className="small-fab flex justify-center items-center" onClick={() => {
                  setIsScanActive(true)
                }}>
                  <IconScan />
                </button>
              </>
            }
            <button className="fab" onClick={() => {
              setPlusFubActive(!plusFubActive)
            }}>
              <IconPlus />
            </button>
          </div>
        </> }
      </div>
    </div>
  </>
}
