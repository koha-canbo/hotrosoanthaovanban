import { Extension } from "@tiptap/core";

export interface IndentOptions {
  types: string[];
  minLevel: number;
  maxLevel: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: "indent",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const paddingLeft = element.style.paddingLeft;
              if (paddingLeft && paddingLeft.endsWith("cm")) {
                return parseInt(paddingLeft, 10) || 0;
              }
              return 0;
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `padding-left: ${attributes.indent}cm`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const indent = node.attrs.indent || 0;
              if (indent < this.options.maxLevel) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: indent + 1,
                });
              }
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const indent = node.attrs.indent || 0;
              if (indent > this.options.minLevel) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: indent - 1,
                });
              }
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      "Shift-Tab": () => this.editor.commands.outdent(),
    };
  },
});
