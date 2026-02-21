import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, mergeAdjacentNodes, flattenContent } from "../text/inlineNodes";

export const deleteForwardCommand: Command = {
  id: "core.deleteForward",
  run({ state }) {
    const sel = state.selection;
    if (!sel || sel.kind !== "text") return null;

    const blocks = state.document.blocks;
    const blockIndex = blocks.findIndex(b => b.id === sel.blockId);
    if (blockIndex < 0) return null;

    const block = blocks[blockIndex];
    const fullText = flattenContent(block.content);
    const start = Math.min(sel.anchor, sel.focus);
    const end = Math.max(sel.anchor, sel.focus);

    // Range selection: delete the selected range
    if (start !== end) {
      const newContent = spliceContent(block.content, start, end, []);
      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: newContent },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
      ];
      return patches;
    }

    // Cursor at end: merge with next block
    if (start >= fullText.length) {
      if (blockIndex >= blocks.length - 1) return null;
      const nextBlock = blocks[blockIndex + 1];
      const mergedContent = mergeAdjacentNodes([...block.content, ...nextBlock.content]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: mergedContent },
        { type: "deleteBlock", blockId: nextBlock.id },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
      ];
      return patches;
    }

    // Normal: delete char after cursor
    const newContent = spliceContent(block.content, start, start + 1, []);
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: newContent },
      { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
    ];
    return patches;
  }
};
