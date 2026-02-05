import type { Command } from "./Command";
import type { BlockNode } from "../state/DocumentState";

export const insertParagraphCommand: Command = {
  id: "core.insertParagraph",
  run({ state }) {
    const block: BlockNode = {
      id: crypto.randomUUID(),
      type: "paragraph",
      content: [{ type: "text", value: "" }]
    };

    const index = state.document.blocks.length;

    return [
      {
        type: "insertBlock",
        block,
        index
      },
      {
        type: "setSelection",
        selection: {
          kind: "text",
          blockId: block.id,
          anchor: 0,
          focus: 0
        }
      }
    ];
  }
};
