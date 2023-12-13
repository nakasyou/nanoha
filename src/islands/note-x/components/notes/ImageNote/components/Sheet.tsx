import { For, createEffect } from "solid-js"

export interface Position {
  x: number
  y: number
}
export interface Sheet {
  positions: Position[]
  weight: number
  startPosition: Position
}
export type Sheets = Sheet[]
export interface Props {
  /**
   * 編集モードなら `false`
   */
  isPlayMode: boolean

  sheets: Sheets

  onClickSheet: (index: number) => void

  width: number
  height: number
}
export default (props: Props) => {
  createEffect(() => {
    console.log(props.sheets)
  })
  return <svg width={props.width} height={props.height}>
    <For each={props.sheets}>{(sheet, index) => {
      const commands: (string | number)[] = ['M' + sheet.startPosition.x + ',' + sheet.startPosition.y]
      for (const position of sheet.positions) {
        commands.push('L' + position.x + ',' + position.y)
      }
      return <path
        d={commands.join(' ')} stroke="#fff" stroke-width={sheet.weight}
        fill="none"
        onClick={() => props.onClickSheet(index())}
        class="stroke-primary-container"
        stroke-opacity="0.5"
      />
    }}</For>    
  </svg>
}
