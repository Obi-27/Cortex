import type { Tool } from "../../core/tools/Tool";
import type { EditorInputEvent } from "../../core/tools/EditorInputEvent";
import { insertParagraphCommand } from "../../core/commands/insertParagraph";
import { createInsertTextCommand } from "../../core/commands/insertText";
import { deleteBackwardCommand } from "../../core/commands/deleteBackward";
import { deleteForwardCommand } from "../../core/commands/deleteForward";

export const CoreEditingTool: Tool = {
  id: "core.editing",

  isRelevant() {
    return true; // always active
  },

  interceptInput(event: EditorInputEvent) {
    if (event.kind === "beforeinput") {
      switch (event.inputType) {
        case "insertText":
          if (event.data) return createInsertTextCommand(event.data);
          return null;
        case "deleteContentBackward":
          return deleteBackwardCommand;
        case "deleteContentForward":
          return deleteForwardCommand;
        case "insertParagraph":
          return insertParagraphCommand;
        default:
          return null;
      }
    }

    return null;
  }
};
