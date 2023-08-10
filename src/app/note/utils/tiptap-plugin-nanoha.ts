import {
  Editor,
  Mark,
  mergeAttributes,
} from '@tiptap/core'

export const TipTapPluginNanoha = Mark.create({
  name: 'sheet',
  priority: 1000,
  addOptions() {},
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      style: "background-color: #f88;",
      class: "nanoha-sheet",
    }), 0]
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          return element.getAttribute("class") === "nanoha-sheet"
        }
      },
    ];
  },
  addCommands() {
    return {
      toggleSheet: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
    }
  },
})
