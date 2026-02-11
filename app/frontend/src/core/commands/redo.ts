import type { Command } from "./Command";

export const redoCommand: Command = {
  id: "core.redo",
  run() {
    // Handled directly by dispatchCommand
    return null;
  }
};
