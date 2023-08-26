import {
  mergeAttributes,
  Node,
} from '@tiptap/core'

export interface ImegeNoteOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImageNote: (options: { src: string, alt?: string, title?: string }) => ReturnType,
    }
  }
}


export const Image = Node.create<ImegeNoteOptions>({
  name: 'image',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs (node) {
          if (typeof node === "string") {
            return false
          }
          return ('nanohaimagenote' in node.dataset as unknown as null)
        }
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      children: [0],
      'data-nanohaimagenote': true,
    })]
  },

  addCommands() {
    return {
      setImageNote: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  }
})