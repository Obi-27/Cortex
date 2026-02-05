import type { Command } from "./Command";
import { applyPatch } from "../patches/applyPatch";

export const undoCommand: Command = {
  id: "core.undo",
  run({ state }) {
    const entry = state.history.past.at(-1);
    if (!entry) return null;

    applyPatch(state, entry.inverse);

    return {
      type: "batch",
      patches: [
        entry.inverse,
        {
          type: "setSelection",
          selection: entry.selectionBefore
        }
      ]
    };
  }
};
