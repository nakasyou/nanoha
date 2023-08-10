import {
  Editor,
  Mark,
  mergeAttributes,
} from '@tiptap/core'

export const TipTapPluginNanoha = Mark.create({
  name: 'sheet',
  priority: 1000,
  addOptions() {
    return {
      HTMLAttributes: {},
    }
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
  
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      style: "background-color: #f88;",
      class: "nanoha-sheet",
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
})
