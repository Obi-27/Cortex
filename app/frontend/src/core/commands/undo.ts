import type { Command } from "./Command";

export const undoCommand: Command = {
  id: "core.undo",
  run() {
    // Handled directly by dispatchCommand
    return null;
  }
};
