import { type AnyExtension, Mark, Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sheet: {
      /**
       * Set a sheet mark
       */
      toggleSheet: () => ReturnType
    }
  }
}

export const ExtensionPreviewLLM = Node.create({
  name: 'llmpreview',
  group: 'block',

  content: 'inline*',
  addAttributes() {
    return {
      id: {
        default: 'aa',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'pre',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }
          const result =
            'llmpreview' in element.dataset
              ? {
                  id: element.id,
                  dataset: element.dataset,
                }
              : false
          return result
        },
      },
    ]
  },
  renderHTML(props) {
    return [
      'pre',
      mergeAttributes(props.HTMLAttributes, {
        'data-llmpreview': 'true',
      }),
      0,
    ]
  },
})
export const ExtensionSheet = (opts: {
  sheetClassName?: string
}): AnyExtension =>
  Mark.create({
    name: 'sheet',
    priority: 1000,
    addOptions() {
      return {
        HTMLAttributes: {},
      }
    },
    // @ts-ignore
    parseHTML() {
      return [
        {
          tag: 'span',
          getAttrs: (element) => {
            if (typeof element === 'string') {
              return false
            }
            return 'nanohasheet' in element.dataset
          },
        },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          class: `nanoha-sheet ${opts.sheetClassName || ''}`,
          'data-nanohasheet': 'true',
        }),
        0,
      ]
    },

    addCommands() {
      return {
        toggleSheet:
          () =>
          ({ commands }) => {
            return commands.toggleMark(this.name)
          },
      }
    },

    addKeyboardShortcuts() {
      return {
        'Mod-Shift-S': () => this.editor.commands.toggleSheet(),
        'Mod-Shift-s': () => this.editor.commands.toggleSheet(),
      }
    },
  })
