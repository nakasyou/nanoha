import { For, createEffect, createSignal } from 'solid-js'
import { noteBookState } from '../../../../store'

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

  class?: string
}
export default (props: Props) => {
  const [getSheets, setSheets] = createSignal(
    props.sheets.map((sheet) => {
      return {
        sheet,
        isHide: false,
      }
    }),
  )
  createEffect(() => {
    const sheetDefaultState = noteBookState.sheetDefaultState
    setSheets(
      props.sheets.map((sheet) => {
        return {
          sheet,
          isHide: !sheetDefaultState,
        }
      }),
    )
  })

  return (
    <svg class={props.class} viewBox={`0 0 ${props.width} ${props.height}`}>
      <title>Sheet</title>
      <For each={getSheets()}>
        {(sheet, index) => {
          const commands: (string | number)[] = [
            `M${sheet.sheet.startPosition.x},${sheet.sheet.startPosition.y}`,
          ]
          for (const position of sheet.sheet.positions) {
            commands.push(`L${position.x},${position.y}`)
          }
          return (
            <path
              d={commands.join(' ')}
              stroke="#fff"
              stroke-width={sheet.sheet.weight}
              fill="none"
              onClick={() => {
                props.onClickSheet(index())
                if (props.isPlayMode) {
                  const newSheetStates = getSheets()
                  newSheetStates[index()]!.isHide =
                    !newSheetStates[index()]!.isHide
                  setSheets([...newSheetStates])
                }
              }}
              class="stroke-primary-container"
              stroke-opacity={
                props.isPlayMode
                  ? getSheets()[index()]!.isHide
                    ? '1.0'
                    : '0.5'
                  : '0.5'
              }
            />
          )
        }}
      </For>
    </svg>
  )
}
