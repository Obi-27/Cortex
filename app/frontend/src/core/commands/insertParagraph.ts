import type { Command } from "./Command";
import type { BlockNode } from "../state/DocumentState";
import type { Patch } from "../patches/Patch";
import { sliceContent, flattenContent } from "../text/inlineNodes";

export const insertParagraphCommand: Command = {
  id: "core.insertParagraph",
  run({ state }) {
    const sel = state.selection;

    // Cursor-aware split
    if (sel && sel.kind === "text") {
      const blockIndex = state.document.blocks.findIndex(b => b.id === sel.blockId);
      if (blockIndex < 0) return null;

      const block = state.document.blocks[blockIndex];
      const totalLen = flattenContent(block.content).length;
      const start = Math.min(sel.anchor, sel.focus);
      const end = Math.max(sel.anchor, sel.focus);

      const contentBefore = sliceContent(block.content, 0, start);
      const contentAfter = sliceContent(block.content, end, totalLen);

      const newBlock: BlockNode = {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: contentAfter
      };

      const patches: Patch[] = [
        {
          type: "updateBlock",
          blockId: block.id,
          content: contentBefore
        },
        {
          type: "insertBlock",
          block: newBlock,
          index: blockIndex + 1
        },
        {
          type: "setSelection",
          selection: {
            kind: "text",
            blockId: newBlock.id,
            anchor: 0,
            focus: 0
          }
        }
      ];

      return patches;
    }

    // Fallback: append empty block
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
