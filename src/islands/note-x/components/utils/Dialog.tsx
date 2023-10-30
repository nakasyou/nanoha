import IconX from '@tabler/icons/x.svg?raw'
import { removeIconSize } from '../../utils/icon/removeIconSize'
import { createSignal } from 'solid-js'

export type DialogStyle = 'confirm'
/**
 * ダイアログ
 * @param props 
 * @returns 
 */
export const Dialog = <T extends DialogStyle,> (props: {
  children: import('solid-js').JSX.Element | undefined
  onClose (result: ({
    confirm: boolean
  })[T]): void
  type: T

  title: string
}) => {
  const [isOpen, setIsOpen] = createSignal(false)
  const close = (result: Parameters<typeof props.onClose>[0]) => {
    setIsOpen(false)
    setTimeout(() => {
      props.onClose(result)
    }, 150)
  }
  setTimeout(() => {
    setIsOpen(true)
  }, 0)
  
  return <div class="fixed top-0 left-0 w-screen h-screen p-4 bg-[#000a] z-10">
    <div class='rounded-lg border bg-background p-2 transition duration-150 scale-0' classList={{
      'scale-0': !isOpen(),
      'scale-100': isOpen()
    }}>
      <div class="flex justify-between items-center">
        <div class="text-2xl">
          { props.title }
        </div>
        <div onClick={() => {
          if (props.type === 'confirm') {
            return close(false)
          }
        }}>
          <div innerHTML={removeIconSize(IconX)} class="w-6 h-6" />
        </div>
      </div>
      <div class="mx-4">
        { props.children }
      </div>
      <div>
        <div class="flex justify-center items-center gap-2 flex-wrap mx-5">
          <button class="outlined-button" onClick={() => close(true)}>
            はい
          </button>
          <button class="outlined-button" onClick={() => close(false)}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  </div>
}
