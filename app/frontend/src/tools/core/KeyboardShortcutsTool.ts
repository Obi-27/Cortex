import type { Tool } from "../../core/tools/Tool";
import type { EditorInputEvent } from "../../core/tools/EditorInputEvent";
import { undoCommand } from "../../core/commands/undo";
import { redoCommand } from "../../core/commands/redo";
import { createToggleMarkCommand } from "../../core/commands/toggleMark";

export const KeyboardShortcutsTool: Tool = {
  id: "core.keyboardShortcuts",

  isRelevant() {
    return true;
  },

  interceptInput(event: EditorInputEvent) {
    if (event.kind !== "key") return null;
    const eventKey = event.key.toLowerCase();

    const mod = event.ctrl || event.meta;
    if (!mod) return null;

    if (eventKey === "z" && !event.shift) return undoCommand;
    if (eventKey === "z" && event.shift) return redoCommand;
    if (eventKey === "y" && !event.shift) return redoCommand;

    if (eventKey === "b") return createToggleMarkCommand("bold");
    if (eventKey === "i") return createToggleMarkCommand("italic");
    if (eventKey === "e") return createToggleMarkCommand("code");

    return null;
  }
};
