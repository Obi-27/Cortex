import type { EditorState } from "./EditorState";

export function createEditorState(): EditorState {
  return {
    document: {
      id: "doc-1",
      blocks: [
        {
          id: "block-1",
          type: "paragraph",
          content: [{ type: "text", value: "Hello Cortex" }]
        }
      ]
    },
    selection: null,
    history: {
      past: [],
      future: []
    }
  };
}
