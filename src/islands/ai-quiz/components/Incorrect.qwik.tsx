/** @jsxImportSource @builder.io/qwik */
import { $, component$, noSerialize, type NoSerialize, useComputed$, useSignal, type QRL } from '@builder.io/qwik'
import { removeIconSize } from '../../note/utils/icon/removeIconSize'
import iconChevronRight from '@tabler/icons/outline/chevron-right.svg?raw'
import iconSend from '@tabler/icons/outline/send.svg?raw'
import { useContext, type Signal } from '@builder.io/qwik'
import { QUIZ_STATE_CTX } from '../store'
import { getGoogleGenerativeAI } from '../../shared/gemini'
import dedent from 'dedent'
import type { ChatSession } from '@google/generative-ai'
import { Loading } from './Utils.qwik'

const NextButton = component$<{
  onClick$: () => void
}>((props) => (<div>
  <button class="flex items-center" onClick$={props.onClick$} type="button">
    <div class="font-bold text-lg hidden md:block">Next</div>
    <div dangerouslySetInnerHTML={removeIconSize(iconChevronRight)} class="w-16 h-16" />
  </button>
</div>))

export const AIExplanation = component$<{
  explanationMode: Signal<'ai' | 'source'>
  explanation: string
  incorrectAnswer: string
}>((props) => {
  const quizState = useContext(QUIZ_STATE_CTX)
  const chatSession = useSignal<NoSerialize<ChatSession> | null>(null)

  const prompt = useSignal('')

  const history = useSignal<{
    text: string
    role: 'user' | 'ai',
    generating?: boolean
  }[]>([
    { text: props.explanation.repeat(1000), role: 'ai' }
  ])

  const sendMessage = $(async () => {
    history.value = [
      ...history.value,
      { text: prompt.value, role: 'user' },
      { text: '', role: 'ai', generating: true }
    ]
    prompt.value = ''

    const ai = getGoogleGenerativeAI()
    if (!ai) {
      return alert('AI設定でエラーです')
    }

    if (!chatSession.value) {
      const chat = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: {
          role: 'model',
          parts: [{
            text: dedent`
            ユーザーは、「${quizState.current?.quiz.content.question}」という質問に対して「${props.incorrectAnswer}」という誤りをしてしまいました。
            ユーザーはそれに関する質問をしてくるので、回答しなさい。
            なお、問題に関する情報は以下の通りです。この情報をユーザーへの回答に活用しなさい:
            ${quizState.current?.quiz.source.canToJsonData.html}`
          }]
        }
      }).startChat()
      chatSession.value = noSerialize(chat)
    }
    const chat = chatSession.value!
    const stream = await chat.sendMessageStream(prompt.value)

    for await (const chunk of stream.stream) {
      const newHistory = [...history.value]
      const last = newHistory.at(-1)
      if (last && last.role === 'ai') {
        last.text += chunk.text()
      }
      history.value = newHistory
    }
    const newHistory = [...history.value]
    const last = newHistory.at(-1)
    if (last && last.role === 'ai') {
      last.generating = false
    }
    history.value = newHistory
  })
  return <div class="h-full">
    <div class="flex gap-2 sticky top-0 bg-background">
      <div class="font-bold">✨NanohaAIによる解説</div>
      <button onClick$={() => {
        props.explanationMode.value = 'source'
      }} class="underline hover:no-underline block lg:hidden">ソースを表示</button>
    </div>
    <div>
      {
        history.value.map(message => <div>
          <div class="font-bold">
            { message.role === 'user' ? 'あなた' : 'NanohaAI' }
            { message.generating && <> <Loading /></> }
          </div>
          <div>{ message.text }</div>
        </div>)
      }
      <div class="h-20" />
    </div>
    <div class="flex items-center justify-start sticky bottom-0 bg-background p-2 rounded-full border">
      <input bind:value={prompt} placeholder='Ask NanohaAI' class='rounded-full p-2 border m-1' />
      <button
        dangerouslySetInnerHTML={removeIconSize(iconSend)}
        class="w-8 h-8 disabled:opacity-30"
        title='send message'
        onClick$={sendMessage}
        disabled={history.value.at(-1)?.generating || !prompt.value}
      ></button>
    </div>
  </div>
})

export const SourceNote = component$<{
  explanationMode: Signal<'ai' | 'source'>
  source: string
}>((props) => {
  return <div>
    <div class="flex gap-2 sticky top-0 bg-background">
      <div class="font-bold">📒使用されたノート</div>
      <button onClick$={() => {
        props.explanationMode.value = 'ai'
      }} class="underline hover:no-underline block lg:hidden">解説を表示</button>
    </div>
    <div dangerouslySetInnerHTML={props.source} />
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

  const aiNoteExplanation = <AIExplanation incorrectAnswer={props.incorrectAnswer} explanationMode={explanationMode} explanation={quizState.current?.quiz.content.explanation ?? ''} />
  const sourceNoteExplanation = <SourceNote explanationMode={explanationMode} source={sourceNote.value ?? ''} />
  return <div class="flex flex-col h-[100dvh]">
    <div class="fixed top-0 right-0 z-20">
      <NextButton onClick$={() => {
        props.onEnd$()
      }}/>
    </div>

    <div class="text-3xl text-center my-2">😒不正解..</div>

    <div class="grid grid-cols-1 lg:grid-cols-2 place-items-center">
      <div class="text-xl text-center">{quizState.current?.quiz.content.question}</div>
      <div class="flex lg:block flex-wrap gap-2 my-2 text-center justify-center">
        <div class="text-center">✖あなたの回答: <span class="text-error">{props.incorrectAnswer}</span></div>
        <div class="text-center">✅正解: <span class="text-green-400">{quizState.current?.quiz.content.correctAnswer}</span></div>
      </div>
    </div>

    <div class="py-3 h-full justify-around grow">
      <div class="hidden grid-cols-1 lg:grid-cols-2 h-full lg:grid gap-3">
        {aiNoteExplanation}
        {sourceNoteExplanation}
      </div>
      <div class="block lg:hidden">
        {
          explanationMode.value === 'ai' ? aiNoteExplanation : sourceNoteExplanation
        }
      </div>
    </div>
  </div>
})