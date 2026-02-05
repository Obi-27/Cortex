import type { Tool } from "../../core/tools/Tool";
import type { EditorInputEvent } from "../../core/tools/EditorInputEvent";
import { insertParagraphCommand } from "../../core/commands/insertParagraph";

export const CoreEditingTool: Tool = {
  id: "core.editing",

  isRelevant() {
    return true; // always active
  },

  interceptInput(event: EditorInputEvent) {
    if (event.kind !== "key") return null;

    if (event.key === "Enter" && !event.shift) {
      return insertParagraphCommand;
    }

    return null;
  }
};
