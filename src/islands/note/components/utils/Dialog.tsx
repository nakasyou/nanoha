import IconX from '@tabler/icons/outline/x.svg?raw'
import { removeIconSize } from '../../utils/icon/removeIconSize'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'

export type DialogStyle = 'confirm' | 'custom' | 'alert'

export const createDialog = <T,>(): CreatedDialog<T> => ({
  close(result) {
    if (this.closeHandler) {
      this.closeHandler(result)
    }
  },
})
export interface CreatedDialog<T> {
  closeHandler?: (result: T) => void
  close(result: T): void
}

type CloseResult<T extends DialogStyle, U> = {
  confirm: boolean
  custom: U | false
  alert: false
}[T]
/**
 * ダイアログ
 * @param props
 * @returns
 */
export const Dialog = <T extends DialogStyle, U extends any = any>(
  props: {
    children:
      | import('solid-js').JSX.Element
      | undefined
      | ((
          close: (result: CloseResult<T, U>) => void,
        ) => import('solid-js').JSX.Element)
    onClose(result: CloseResult<T, U>): void
    type: T

    title: string
    class?: string

    okLabel?: string
  } & ('custom' extends T
    ? {
        dialog: ReturnType<typeof createDialog<U>>
      }
    : {}),
) => {
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
  if (props.type === 'custom') {
    // @ts-ignore
    props.dialog.closeHandler = (data: any) => {
      close(data)
    }
  }

  const handleEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
      close(false)
    }
  }
  onMount(() => {
    document.addEventListener('keydown', handleEsc)
  })
  onCleanup(() => {
    document.removeEventListener('keydown', handleEsc)
  })
  return (
    <div class="fixed top-0 left-0 w-screen h-screen p-4 bg-[#000a] z-50 ">
      <div
        class="rounded-lg border bg-background p-2 transition duration-150 scale-0"
        classList={{
          'scale-0': !isOpen(),
          'scale-100': isOpen(),
          ...Object.fromEntries([[props.class || '', true]]),
        }}
      >
        <div class="flex justify-between items-center">
          <div class="text-2xl">{props.title}</div>
          <div
            onClick={() => {
              // @ts-ignore
              return close(props.type === 'alert' ? undefined : false)
            }}
            title="閉じる (esc)"
            class="p-2 rounded-full hover:border grid items-center justify-center"
          >
            <div innerHTML={removeIconSize(IconX)} class="w-8 h-8" />
          </div>
        </div>
        <div class="mx-4">
          {typeof props.children === 'function'
            ? props.children((result) => {
                close(result)
              })
            : props.children}
        </div>
        {(props.type === 'confirm' || props.type === 'alert') && (
          <div>
            <div class="flex justify-center items-center gap-2 flex-wrap mx-5">
              <button
                class="filled-button"
                onClick={() =>
                  close(
                    // @ts-expect-error
                    true,
                  )
                }
              >
                {props.okLabel ?? (props.type === 'alert' ? 'OK' : 'はい')}
              </button>
              <Show when={props.type !== 'alert'}>
                <button class="outlined-button" onClick={() => close(false)}>
                  キャンセル
                </button>
              </Show>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
