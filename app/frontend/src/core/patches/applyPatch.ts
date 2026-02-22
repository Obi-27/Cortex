import type { EditorState } from "../state/EditorState";
import type { Patch } from "./Patch";

export function applyPatch(
  state: EditorState,
  patch: Patch
): EditorState {
  switch (patch.type) {
    case "insertBlock": {
      const blocks = [...state.document.blocks];
      blocks.splice(patch.index, 0, patch.block);

      return {
        ...state,
        document: {
          ...state.document,
          blocks
        }
      };
    }

    case "updateBlock": {
      const blocks = state.document.blocks.map(block =>
        block.id === patch.blockId
          ? { ...block, content: patch.content }
          : block
      );

      return {
        ...state,
        document: {
          ...state.document,
          blocks
        }
      };
    }

    case "deleteBlock": {
      const blocks = state.document.blocks.filter(
        b => b.id !== patch.blockId
      );

      return {
        ...state,
        document: {
          ...state.document,
          blocks
        }
      };
    }

    case "setSelection": {
      return {
        ...state,
        selection: patch.selection
      };
    }

    case "setStoredMarks": {
      return {
        ...state,
        storedMarks: patch.marks
      };
    }

    case "batch": {
  return patch.patches.reduce(
    (s, p) => applyPatch(s, p),
    state
  );
}

    default:
      return state;
  }
}
