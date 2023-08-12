import TextNote from "./components/TextNote.tsx"
import {
  IconPlayerPlay,
  IconEdit,
  IconEye,
  IconPlus,
  IconScan,
  IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import classnames from "classnames"

export interface Props {
  
}
export default function(props: Props){
  const [mode, setMode] = useState<"edit" | "play">("edit")
  const [isView, setIsView] = useState(false)

  const [plusFubActive, setPlusFubActive] = useState(false)
  return <>
    <div className="bg-background text-on-background min-h-screen">
      <div>This is app!</div>
      <div>
        <TextNote mode={mode} isView={isView} defaultContent={`
        <p>こんにちは！これはNanohaNoteです！</p>
        <p>NanohaNoteは、「じぶん」で作る、学習用ノートブックです！</p>
        <p>暗記をスムーズに行えます。</p>
        <p>例えば、こんなことができちゃいます:</p>
        <p>「Scratchでプログラミングするように、視覚的にプログラミングすることを、<span data-nanohasheet="true">ビジュアルプログラミング</span>という」</p>
        <p>じゃーん。すごいでしょ。<b>こんなふうに太字</b>にしたり、<del>証拠隠滅</del>したりできます。</p>
        <p>さあ、あなたの思いのままのノートにしましょう！この説明を消してもいいですよ〜</p>
        `} />
      </div>
      <div className="fixed bottom-0 w-full bg-secondary-container">
        {/* Navbar */}
        <div className="flex gap-4 justify-center items-center m-2">
          <div className="flex justify-center items-center bg-lime-50 rounded-full">
            <button onClick={()=>setMode("edit")} className={classnames("p-4 rounded-full", { "bg-lime-300": mode === "edit" })}>
              <IconEdit />
            </button>
            <button onClick={()=>setMode("play")} className={classnames("p-4 rounded-full", { "bg-lime-300": mode === "play" })}>
              <IconPlayerPlay />
            </button>
          </div>
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
                <button className="fab" onClick={() => setPlusFubActive(false)}>
                  <IconX />
                </button>
                <button className="fab">
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
