import {
  Extension,
  Mark,
  mergeAttributes,
  type AnyExtension,
} from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sheet: {
      /**
       * Set a sheet mark
       */
      toggleSheet: () => ReturnType,
    }
  }
}

export const ExtensionSheet = (opts: {
  sheetClassName?: string

}): AnyExtension => Mark.create({
  name: 'sheet',
  priority: 1000,
  addOptions () {
    return {
      HTMLAttributes: {},
    }
  },
  // @ts-ignore
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          if (typeof element === "string") {
            return false
          }
          return "nanohasheet" in element.dataset
        }
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      class: "nanoha-sheet " + (opts.sheetClassName || ''),
      "data-nanohasheet": "true",
    }), 0]
  },

  addCommands() {
    return {
      toggleSheet: () => ({ commands }) => {
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
