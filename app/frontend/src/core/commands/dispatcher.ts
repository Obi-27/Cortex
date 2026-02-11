import type { EditorState } from "../state/EditorState";
import type { Command } from "./Command";
import { applyPatch } from "../patches/applyPatch";
import { invertPatch } from "../patches/invertPatch";
import type { Patch } from "../patches/Patch";
import type { HistoryEntry } from "../state/HistoryState";
import type { BlockNode } from "../state/DocumentState";
import type { SelectionState } from "../state/SelectionState";

function normalizePatches(
  patches: Patch | Patch[] | null
): Patch[] {
  if (!patches) return [];
  return Array.isArray(patches) ? patches : [patches];
}

function applyAndRecordPatches(
  state: EditorState,
  patches: Patch[]
): { nextState: EditorState; historyPatches: Patch[]; inversePatches: Patch[] } {
  let nextState = state;
  const historyPatches: Patch[] = [];
  const inversePatches: Patch[] = [];

  for (const patch of patches) {
    let prevBlock: BlockNode | undefined;
    let prevBlockIndex: number | undefined;
    let prevSelection: SelectionState | undefined;

    if (patch.type === "updateBlock" || patch.type === "deleteBlock") {
      prevBlockIndex = nextState.document.blocks.findIndex(
        b => b.id === patch.blockId
      );
      prevBlock = prevBlockIndex >= 0
        ? nextState.document.blocks[prevBlockIndex]
        : undefined;
    }

    if (patch.type === "setSelection") {
      prevSelection = nextState.selection;
    }

    nextState = applyPatch(nextState, patch);

    const inverse = invertPatch(patch, prevBlock, prevBlockIndex, prevSelection);

    historyPatches.push(patch);
    inversePatches.unshift(inverse);
  }

  return { nextState, historyPatches, inversePatches };
}

export function dispatchCommand(
  state: EditorState,
  command: Command
): EditorState {
  const ctx = { state };

  // Undo: pop from past, apply inverse, push to future
  if (command.id === "core.undo") {
    const entry = state.history.past.at(-1);
    if (!entry) return state;

    const patches = normalizePatches(entry.inverse);
    let nextState = state;
    for (const patch of patches) {
      nextState = applyPatch(nextState, patch);
    }

    return {
      ...nextState,
      selection: entry.selectionBefore,
      history: {
        past: state.history.past.slice(0, -1),
        future: [entry, ...state.history.future]
      }
    };
  }

  // Redo: pop from future, apply forward, push to past
  if (command.id === "core.redo") {
    const entry = state.history.future.at(0);
    if (!entry) return state;

    const patches = normalizePatches(entry.patch);
    let nextState = state;
    for (const patch of patches) {
      nextState = applyPatch(nextState, patch);
    }

    return {
      ...nextState,
      selection: entry.selectionAfter,
      history: {
        past: [...state.history.past, entry],
        future: state.history.future.slice(1)
      }
    };
  }

  // Normal commands: apply, record history, clear future
  const patches = normalizePatches(command.run(ctx));
  if (patches.length === 0) return state;

  const selectionBefore = state.selection;
  const { nextState, historyPatches, inversePatches } = applyAndRecordPatches(state, patches);

  const entry: HistoryEntry = {
    patch: { type: "batch", patches: historyPatches },
    inverse: { type: "batch", patches: inversePatches },
    selectionBefore,
    selectionAfter: nextState.selection
  };

  return {
    ...nextState,
    history: {
      past: [...state.history.past, entry],
      future: []
    }
  };
}
