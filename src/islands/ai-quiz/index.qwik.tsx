/** @jsxImportSource @builder.io/qwik */

import { $, type NoSerialize, component$, useSignal, noSerialize, createContextId, useStore, useContextProvider, useContext, useVisibleTask$, type JSXOutput, useComputed$, useStylesScoped$ } from '@builder.io/qwik'
import type { NoteLoadType } from '../note/note-load-types'
import { handleLoaded } from '../shared/q-utils'
import { loadNoteFromType } from '../shared/storage'
import { getGeminiApiToken } from '../shared/store'
import { load } from '../note/utils/file-format'
import type { MargedNote, NoteData } from '../note/components/notes-utils'
import { generateWithLLM } from '../shared/ai'
import { PROMPT_TO_GENERATE_QUESTION, QUESTION_SCHEMA, type Question } from './constants'
import type { TextNoteCanToJsonData } from '../note/components/notes/TextNote/types'
import TurndownService from 'turndown'
import { parse } from 'valibot'
import classNames from 'classnames'
import { wave } from '@ns/ha'
import iconSend from '@tabler/icons/outline/send.svg?raw'
import { removeIconSize } from '../note/utils/icon/removeIconSize'
import iconChevronRight from '@tabler/icons/outline/chevron-right.svg?raw'

const turnDown = new TurndownService({
  headingStyle: 'atx'
})

interface Store {
  note: NoSerialize<{
    name: string
    notes: NoteData<any, string>[]
  }> | 'pending' | 'notfound' | 'invalid'
  aiChecked: boolean | null
  isStarted: boolean
}
const STORE_CTX = createContextId<Store>('store')

const InitialScreen = component$(() => {
  const store = useContext(STORE_CTX)

  const loadingState = useSignal<string | null>('Loading...')
  const loadError = useSignal<string | null | JSXOutput>(null)

  useVisibleTask$(({ track }) => {
    track(() => store.note)

    if (store.note === 'notfound') {
      loadError.value = 'ノートが見つかりませんでした'
      return
    }
    if (store.note === 'pending') {
      loadingState.value = 'ノートを読み込んでいます...'
      return
    }
    if (store.note === 'invalid') {
      loadError.value = 'ノートの読み込みに失敗しました'
      return
    }
    if (store.aiChecked === null) {
      loadingState.value = 'AI機能をチェックしています...'
      return
    }
    if (store.aiChecked === false) {
      loadError.value = <div>AI 機能を使用するための設定が完了していません。<a class="underline hover:no-underline" href="/app/settings#ai">設定</a>から変更してください</div>
      return
    }
    loadingState.value = null
  })
  return <div class="w-full h-full grid place-items-center">
    <div class="text-center">
      <div class="text-4xl font-bold">Quiz with AI</div>
      <hr class="my-2" />
      <div class="text-lg">AI によるスムーズな学習</div>
      <div>
        <button onClick$={() => store.isStarted = true} class="filled-button m-3 disabled:opacity-40" disabled={loadingState.value !== null}>Start</button>
        {
          loadingState.value && <div class="text-on-surface-variant">{ loadingState.value }</div>
        }
        {
          loadError.value && <div class="text-error">{ loadError.value }</div>
        }
      </div>
    </div>
  </div>
})

interface Quiz {
  question: Question
  sourceNoteIndex: number
}

const createQuestionsGenerator = (notes: MargedNote[]): ((cb: (q: Quiz) => void) => Promise<void>) => {
  const chunks: string[] = []

  for (const note of notes) {
    if (note.type !== 'text') {
      continue
    }
    const html = (note.canToJsonData as TextNoteCanToJsonData).html
    const content = turnDown.turndown(html)
    chunks.push(content)
  }

  return async (cb) => {
    const q = 
      {
        question: {answers: ['酸素と水素', '酸素と窒素', '水素と水'],
        correctIndex: 0,
        explanation: '水を電気分解すると、水は水素と酸素に分解されます。このプロセスでは、水分子 (H2O) に電気エネルギーが供給され、水素ガス (H2) と酸素ガス (O2) として元素に分解されます。水の電気分解は、水分子が電気回路を通って陽極と陰極に移動するプロセスです。陰極（負極）では、水分子が電子を獲得し、水素ガス（H2）に還元されます。一方、陽極（正極）では、水分子が酸化され、酸素ガス（O2）が生成されます。',
        question: '水の電気分解では、水を何に分解しますか?'},
        sourceNoteIndex: 0
      }
    
    cb(q)
    return
    const randomChunkIndex = Math.floor(Math.random() * chunks.length)
    const randomChunk = chunks[randomChunkIndex]!

    const generator = generateWithLLM([
      `${PROMPT_TO_GENERATE_QUESTION}\n${randomChunk}`
    ], 'gemini-pro')
    if (!generator) {
      alert('生成時にエラーが発生しました')
      return
    }

    const result: Question[] = []
    let generatedText = ''
    for await (const res of generator) {
      generatedText += res
      const splitted = generatedText.split('\n')

      for (const [index, line] of Object.entries(splitted)) {
        try {
          const question = parse(QUESTION_SCHEMA, JSON.parse(line))
          result.push(question)
          splitted.splice(parseInt(index), 1)
          cb({ question, sourceNoteIndex: randomChunkIndex })
        } catch (_e) {
          continue
        }
      }
      generatedText = splitted.join('\n')
    }
  }
}

const QUESTIONS = 5


const NextButton = component$<{
  onClick$: () => void
}>((props) => (<div>
  <button class="flex items-center" onClick$={props.onClick$}>
    <div class="font-bold text-lg">Next</div>
    <div dangerouslySetInnerHTML={removeIconSize(iconChevronRight)} class="w-16 h-16" />
  </button>
</div>))

const IncorrectScreen = component$<{
  quiz: Quiz
  yourAnswer: string

  onNext$: () => void
}>((props) => {
  const store = useContext(STORE_CTX)
  const explanationMode = useSignal<'ai' | 'source'>('ai')

  const sourceNote = useComputed$<string>(() => {
    if (typeof store.note === 'string') {
      return `No source`
    }
    const sourceNoteIndex = props.quiz.sourceNoteIndex
    console.log('sourceNoteIndex', sourceNoteIndex)
    const note = store.note!.notes[sourceNoteIndex]
    return note?.canToJsonData.html
  })

  return <div class="flex flex-col h-full">
    <div class="flex justify-end">
      <NextButton onClick$={() => {
        props.onNext$()
      }}/>
    </div>
    <div class="py-3 h-full flex flex-col justify-around grow">
      <div>
        <div class="flex justify-around items-center">
          <div class="text-3xl text-center my-2">😒不正解..</div>
        </div>
        <div class="grid place-items-center grid-cols-1 lg:grid-cols-2">
          <div class="text-xl text-center">{props.quiz.question.question}</div>

          <div class="flex lg:block flex-wrap gap-2 my-2 text-center justify-center">
            <div class="text-center">✖あなたの回答: <span class="text-error">{props.yourAnswer}</span></div>
            <div class="text-center">✅正解: <span class="text-green-400">{props.quiz.question.answers[props.quiz.question.correctIndex]}</span></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 place-items-center">
        <div class="grid justify-center">
          {/* 解説 */}
          <div class="flex gap-2">
            <div class="font-bold block lg:hidden">{ explanationMode.value === 'ai' ? '✨NanohaAIによる解説' : '📒使用されたノート' }</div>
            <div class="font-bold hidden lg:block">✨NanohaAIによる解説</div>
            <button onClick$={() => {
              explanationMode.value = explanationMode.value === 'ai' ? 'source' : 'ai'
            }} class="underline hover:no-underline block lg:hidden">{ explanationMode.value === 'ai' ? 'ソースを表示' : '解説を表示' }</button>
          </div>
          <div class="text-on-surface-variant max-h-[30dvh] overflow-auto">
            <div class="block lg:hidden">
              {
                explanationMode.value === 'ai' && props.quiz.question.explanation
              }
              {
                explanationMode.value === 'source' && <div dangerouslySetInnerHTML={sourceNote.value}></div>
              }
            </div>
            <div class="hidden lg:block">
              { props.quiz.question.explanation }
            </div>
          </div>
          <div class="flex items-center">
            <input placeholder='Ask NanohaAI (WIP)' class="rounded-full p-2 border m-1" />
            <button dangerouslySetInnerHTML={removeIconSize(iconSend)} class="w-8 h-8" title='send message'></button>
          </div>
        </div>
        <div class="hidden lg:block">
          <div class="font-bold">📒使用されたノート</div>
          <div class="text-on-surface-variant max-h-[30dvh] overflow-auto" dangerouslySetInnerHTML={sourceNote.value}></div>
        </div>
      </div>
    </div>
  </div>
})
export const AIQuiz = component$(() => {
  const store = useContext(STORE_CTX)

  const futureQuestions = useSignal<Quiz[]>([])
  const currentQuestion = useSignal<Quiz | null>(null)
  const generatedQuestions = useSignal<number>(0)

  const currentQuestionIndex = useSignal<number>(0)

  const yourAnswer = useSignal('')
  const screenType = useSignal<'question' | 'incorrect'>('question')

  const isShownCorrectDialog = useSignal(false)

  const generateNext = $(async () => {
    if (typeof store.note === 'string' || !store.note) {
      return
    }
    const generator = createQuestionsGenerator(store.note.notes)
    await generator((q) => {
      futureQuestions.value = [...futureQuestions.value, q]
      generatedQuestions.value += 1
    })
  })

  const handleNext = $(() => {
    const nextQuestionIndex = Math.floor(Math.random() * futureQuestions.value.length)
    currentQuestion.value = futureQuestions.value[nextQuestionIndex] ?? null

    const newFutureQuestions = [...futureQuestions.value]
    newFutureQuestions.splice(nextQuestionIndex, 1)

    futureQuestions.value = newFutureQuestions

    currentQuestionIndex.value += 1
  })

  useVisibleTask$(async () => {
    let isFirstGenerated = false
    while (true) {
      await generateNext()
      if (!isFirstGenerated && generatedQuestions.value !== 0) {
        handleNext()
        isFirstGenerated = true
      }
      if (generatedQuestions.value >= QUESTIONS) {
        break
      }
    }
    /*questions.value = [
      {
        answers: ['水素', '酸素'],
        question: '水の電気分解で、陰極に現れる気体は？',
        correctIndex: 0,
        explanation: 'なぜなら、あいうえお'
      }
    ]*/
  })

  const handleCorrect = $(() => {
    isShownCorrectDialog.value = true
    setTimeout(() => {
      handleNext()
    }, 500)
    setTimeout(() => {
      isShownCorrectDialog.value = false
    }, 800)
  })
  const handleIncorrect = $(() => {
    screenType.value = 'incorrect'
  })

  useStylesScoped$(`
    .correctDialog {
      animation: correctDialogAnimation 0.7s ease-in-out forwards;
    }
    @keyframes correctDialogAnimation {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `)
  return <div class="h-full">
    {isShownCorrectDialog.value && (<div class="fixed w-full h-[100dvh] grid place-items-center left-0 top-0 z-50">
      <div class="text-green-400 text-5xl font-bold correctDialog">
        😊正解!!
      </div>
    </div>)}
    {
      screenType.value === 'question' ? (currentQuestion.value ? <div class="p-4 flex flex-col h-full">
        <div>
          <div>問{currentQuestionIndex.value}/{Math.max(QUESTIONS, generatedQuestions.value)}</div>
          <div class="text-2xl text-center">{currentQuestion.value.question.question}</div>
          <hr class="my-2" />
          <div class="text-base text-on-surface-variant text-right">✨AI Generated</div>
        </div>
        <div class="grow grid items-center">
          <div class='flex flex-col gap-2 justify-around grow'>
            {
              currentQuestion.value.question.answers.map((answer, idx) => (
                <button
                  key={idx}
                  class="block filled-button text-xl"
                  onClick$={() => {
                    if (currentQuestion.value?.question?.correctIndex === idx) {
                      handleCorrect()
                    } else {
                      yourAnswer.value = answer
                      handleIncorrect()
                    }
                  }}
                >{ answer }</button>))
            }
          </div>
        </div>
      </div> : <div class="text-center font-bold">生成中...</div>) : <IncorrectScreen quiz={currentQuestion.value!} yourAnswer={yourAnswer.value} onNext$={() => {
        screenType.value = 'question'
        handleNext()
      }} />
    }
  </div>
})
const Header = component$(() => {
  return <div>
    This is Header
  </div>
})

export default component$<{
  noteLoadType: NoteLoadType
}>((props) => {
  const store = useStore<Store>({
    note: 'pending',
    aiChecked: null,
    isStarted: false
  }, {
    deep: false
  })
  useContextProvider(STORE_CTX, store)

  handleLoaded($(async () => {
    const gotNote = await loadNoteFromType(props.noteLoadType)
    //store.note = gotNote ? noSerialize(gotNote) : 'notfound'
    if (!gotNote) {
      store.note = 'notfound'
      return
    }

    const loaded = await load(new Blob([gotNote.nnote]))
    if (!loaded.success) {
      store.note = 'invalid'
      return
    }
    store.note = noSerialize({
      name: gotNote.name,
      notes: loaded.notes
    })

    store.aiChecked = !!getGeminiApiToken()
  }))
  return <div class="flex flex-col h-[100dvh] lg:flex-row w-full">
    <div class="lg:h-[100dvh] lg:border-r border-b lg:border-b-0 border-r-0">
      <Header />
    </div>
    <div class="px-2 w-full pb-5 h-[100dvh] overflow-y-auto grow">
      {
        store.isStarted ? <AIQuiz /> : <InitialScreen />
      }
    </div>
  </div>
})
