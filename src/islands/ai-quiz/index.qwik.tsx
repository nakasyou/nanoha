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

const createQuestionsGenerator = (notes: MargedNote[]): ((cb?: (q: Question) => void) => Promise<Question[]>) => {
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
    const randomChunkIndex = Math.floor(Math.random() * chunks.length)
    const randomChunk = chunks[randomChunkIndex]!

    const generator = generateWithLLM([
      `${PROMPT_TO_GENERATE_QUESTION}\n${randomChunk}`
    ], 'gemini-pro')
    if (!generator) {
      alert('生成時にエラーが発生しました')
      return []
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
          cb?.(question)
        } catch (_e) {
          continue
        }
      }
      generatedText = splitted.join('\n')
    }
    return result
  }
}

const QUESTIONS = 5


const NextButton = component$<{
  onClick$: () => void
}>((props) => (<div>
  <button class="flex items-center" onClick$={props.onClick$}>
    <div>Next</div>
    <div dangerouslySetInnerHTML={removeIconSize(iconChevronRight)} class="w-16 h-16" />
  </button>
</div>))

const IncorrectScreen = component$<{
  question: Question
  yourAnswer: string

  onNext$: () => void
}>((props) => {
  return <div class="py-3 h-full flex flex-col justify-around">
    <div>
      <div class="text-3xl text-center my-2">😒不正解..</div>
      <div class="grid place-items-center grid-cols-1 lg:grid-cols-2">
        <div class="text-xl">{props.question.question}</div>

        <div class="flex lg:block flex-wrap gap-2 my-2">
          <div>✖あなたの回答: <span class="text-error">{props.yourAnswer}</span></div>
          <div>✅正解: <span class="text-green-400">{props.question.answers[props.question.correctIndex]}</span></div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2">
      <div class="grid justify-center">
        {/* 解説 */}
        <div class="font-bold">✨NanohaAIによる解説</div>
        <div>
          {
            props.question.explanation
          }
        </div>
        <div class="flex items-center">
          <input placeholder='Ask NanohaAI (WIP)' class="rounded-full p-2 border m-1" />
          <button dangerouslySetInnerHTML={removeIconSize(iconSend)} class="w-8 h-8" title='send message'></button>
        </div>
      </div>
      <NextButton onClick$={() => {
        props.onNext$()
      }}/>
    </div>
  </div>
})
export const AIQuiz = component$(() => {
  const store = useContext(STORE_CTX)

  const questions = useSignal<Question[]>([])
  const currentQuestionIndex = useSignal(0)
  const currentQuestion = useComputed$(() => {
    return questions.value[currentQuestionIndex.value]
  })

  const yourAnswer = useSignal('')
  const screenType = useSignal<'question' | 'incorrect'>('question')

  const isShownCorrectDialog = useSignal(false)

  const generateNext = $(async () => {
    if (typeof store.note === 'string' || !store.note) {
      return
    }
    const generator = createQuestionsGenerator(store.note.notes)
    await generator((q) => {
      questions.value = [...questions.value, q]
    })
  })

  useVisibleTask$(async () => {
    while (true) {
      await generateNext()
      if (questions.value.length >= QUESTIONS) {
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
      currentQuestionIndex.value += 1
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
    {isShownCorrectDialog.value && (<div class="fixed w-full h-[100dvh] grid place-items-center left-0 top-0">
      <div class="text-green-400 text-5xl font-bold correctDialog">
        😊正解!!
      </div>
    </div>)}
    {
      screenType.value === 'question' ? (currentQuestion.value ? <div class="p-4">
        <div>問{currentQuestionIndex.value + 1}/{QUESTIONS}</div>
        <div>
          <div class="text-2xl text-center">{currentQuestion.value.question}</div>
          <hr class="my-2" />
          <div class="text-base text-on-surface-variant text-right">✨AI Generated</div>
        </div>
        <div class={classNames("grid gap-2 my-3", [
          currentQuestion.value.answers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        ])}>
          {
            currentQuestion.value.answers.map((answer, idx) => (
              <button
                class="block filled-button text-xl"
                onClick$={() => {
                  if (currentQuestion.value?.correctIndex === idx) {
                    handleCorrect()
                  } else {
                    yourAnswer.value = answer
                    handleIncorrect()
                  }
                }}
              >{ answer }</button>))
          }
        </div>
      </div> : <div class="text-center font-bold">生成中...</div>) : <IncorrectScreen question={currentQuestion.value!} yourAnswer={yourAnswer.value} onNext$={() => {
        screenType.value = 'question'
        currentQuestionIndex.value += 1
      }}/>
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
