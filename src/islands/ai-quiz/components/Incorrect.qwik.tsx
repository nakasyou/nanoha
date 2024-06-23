/** @jsxImportSource @builder.io/qwik */
import { component$, useComputed$, useSignal, type QRL } from '@builder.io/qwik'
import { removeIconSize } from '../../note/utils/icon/removeIconSize'
import iconChevronRight from '@tabler/icons/outline/chevron-right.svg?raw'
import iconSend from '@tabler/icons/outline/send.svg?raw'
import { useContext, type Signal } from '@builder.io/qwik'
import { QUIZ_STATE_CTX } from '../store'

const NextButton = component$<{
  onClick$: () => void
}>((props) => (<div>
  <button class="flex items-center" onClick$={props.onClick$}>
    <div class="font-bold text-lg">Next</div>
    <div dangerouslySetInnerHTML={removeIconSize(iconChevronRight)} class="w-16 h-16" />
  </button>
</div>))

export const AIExplanation = component$<{
  explanationMode: Signal<'ai' | 'source'>
  explanation: string
}>((props) => {
  return <div>
    <div class="flex justify-between">
      <div class="font-bold">✨NanohaAIによる解説</div>
      <button onClick$={() => {
        props.explanationMode.value = props.explanationMode.value === 'ai' ? 'source' : 'ai'
      }} class="underline hover:no-underline block lg:hidden">{ props.explanationMode.value === 'ai' ? 'ソースを表示' : '解説を表示' }</button>
    </div>
    <div>
      { props.explanation }
    </div>
  </div>
})

export const Incorrect = component$<{
  onEnd$: QRL<() => void>
  incorrectAnswer: string
}>((props) => {
  const quizState = useContext(QUIZ_STATE_CTX)
  const explanationMode = useSignal<'ai' | 'source'>('ai')

  const sourceNote = useComputed$<string>(() => {
    const note = quizState.current?.quiz.source
    return note?.canToJsonData.html
  })

  return <div class="flex flex-col h-full">
    <div class="flex justify-end">
      <NextButton onClick$={() => {
        props.onEnd$()
      }}/>
    </div>
    <div class="py-3 h-full flex flex-col justify-around grow">
      <div>
        <div class="flex justify-around items-center">
          <div class="text-3xl text-center my-2">😒不正解..</div>
        </div>
        <div class="grid place-items-center grid-cols-1 lg:grid-cols-2">
          <div class="text-xl text-center">{quizState.current?.quiz.content.question}</div>
          <div class="flex lg:block flex-wrap gap-2 my-2 text-center justify-center">
            <div class="text-center">✖あなたの回答: <span class="text-error">{props.incorrectAnswer}</span></div>
            <div class="text-center">✅正解: <span class="text-green-400">{quizState.current?.quiz.content.correctAnswer}</span></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 place-items-center">
        <AIExplanation />
      </div>
    </div>
  </div>
})