
/** @jsx preserve */
//import { onMount } from 'solid-js'
import App from './App'
import type { NoteLoadType } from './note-load-types'

export interface Props {
  noteLoadType: NoteLoadType
}
export default (props: Props) => {
  /*onMount(() => {
    addEventListener('error', (evt) => {
      if (import.meta.env.PROD) {
        document.body.innerHTML ='エラーが発生したみたいです... 再読み込みしてください。'
      }
    })
  })*/
  return <App {...props}/>
}