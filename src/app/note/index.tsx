import TextNote from "./components/TextNote.tsx"
import {
  IconPlayerPlay,
  IconEdit,
  IconEye,
} from "@tabler/icons-react"
import { useState } from "react"
import classnames from "classnames"

export interface Props {
  
}
export default function(props: Props){
  const [mode, setMode] = useState<"edit" | "play">("edit")
  const [isView, setIsView] = useState(false)
  const [notes, setNotes] = useState([<TextNote mode={mode} isView={isView} defaultContent={`
       <p>こんにちは！これはNanohaNoteです！</p>
       <p>NanohaNoteは、「じぶん」で作る、学習用ノートブックです！</p>
       <p>暗記をスムーズに行えます。</p>
       <p>例えば、こんなことができちゃいます:</p>
       <p>「Scratchでプログラミングするように、視覚的にプログラミングすることを、<span data-nanohasheet="true">ビジュアルプログラミング</span>という」</p>
       <p>じゃーん。すごいでしょ。<b>こんなふうに太字</b>にしたり、<del>証拠隠滅</del>したりできます。</p>
       <p>さあ、あなたの思いのままのノートにしましょう！この説明を消してもいいですよ〜</p>
  `} />])
  return <>
    <div>This is app!</div>
    <div>
      {
        notes.map(note => {
          return note
        })
      }
    </div>
    <div className="fixed bottom-0">
      {/* Navbar */}
      <div className="flex gap-4">
        { mode }
        <div className="flex justify-center items-center bg-stone-100 rounded-full">
          <button onClick={()=>setMode("edit")} className={classnames("p-4 rounded-full", { "bg-lime-300": mode === "edit" })}>
            <IconEdit />
          </button>
          <button onClick={()=>setMode("play")} className={classnames("p-4 rounded-full", { "bg-lime-300": mode === "play" })}>
            <IconPlayerPlay />
          </button>
        </div>
      </div>
    </div>
    <div className="fixed bottom-8 right-0">
      {/* 重要ボタンとか言うやつ */}
      { mode === "view" && <div className="flex justify-center items-center gap-2">
        <button onClick={()=>setIsView(!isView)} className="p-4 rounded-full drop-shadow-md bg-emerald-100 hover:bg-emerald-200">
          <IconEye />
        </button>
      </div> }
    </div>
  </>
}