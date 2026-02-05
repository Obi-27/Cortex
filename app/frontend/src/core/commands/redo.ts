import type { Command } from "./Command";

export const redoCommand: Command = {
  id: "core.redo",
  run({ state }) {
    const entry = state.history.future.at(0);
    if (!entry) return null;

    return {
      type: "batch",
      patches: [
        entry.patch,
        {
          type: "setSelection",
          selection: entry.selectionAfter
        }
      ]
    };
  }
};
