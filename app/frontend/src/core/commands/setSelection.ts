import type { Command } from "./Command";
import type { SelectionState } from "../state/SelectionState";

export function createSetSelectionCommand(selection: SelectionState): Command {
  return {
    id: "core.setSelection",
    skipHistory: true,
    run() {
      return {
        type: "setSelection" as const,
        selection
      };
    }
  };
}
