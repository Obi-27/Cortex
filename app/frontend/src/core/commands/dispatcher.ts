import type { EditorState } from "../state/EditorState";
import type { Command } from "./Command";
import { applyPatch } from "../patches/applyPatch";
import { invertPatch } from "../patches/invertPatch";
import type { Patch } from "../patches/Patch";
import type { BlockNode } from "../state/DocumentState";
import type { SelectionState } from "../state/SelectionState";

function normalizePatches(
  patches: Patch | Patch[] | null
): Patch[] {
  if (!patches) return [];
  return Array.isArray(patches) ? patches : [patches];
}

export function dispatchCommand(
  state: EditorState,
  command: Command
): EditorState {
  const ctx = { state };

  const patches = normalizePatches(command.run(ctx));
  if (patches.length === 0) return state;

  let nextState = state;

  const selectionBefore = state.selection;

  const historyPatches: Patch[] = [];
  const inversePatches: Patch[] = [];

  for (const patch of patches) {
    // capture context needed for inversion
    let prevBlock: BlockNode | undefined;
    let prevSelection: SelectionState | undefined;

    if (patch.type === "updateBlock" || patch.type === "deleteBlock") {
      prevBlock = nextState.document.blocks.find(
        b => b.id === patch.blockId
      );
    }

    if (patch.type === "setSelection") {
      prevSelection = nextState.selection;
    }

    nextState = applyPatch(nextState, patch);

    const inverse = invertPatch(patch, prevBlock, prevSelection);

    historyPatches.push(patch);
    inversePatches.unshift(inverse); // reverse order
  }

  return {
    ...nextState,
    history: {
      past: [
        ...state.history.past,
        {
          patch: { type: "batch", patches: historyPatches } as any,
          inverse: { type: "batch", patches: inversePatches } as any,
          selectionBefore,
          selectionAfter: nextState.selection
        }
      ],
      future: []
    }
  };
}
