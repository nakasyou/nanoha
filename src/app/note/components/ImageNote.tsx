import { ModeContext } from "../index.tsx"
import { viewClasses, hideClasses } from '../const/sheetClasses.ts'

import {

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
}
