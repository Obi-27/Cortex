import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, mergeAdjacentNodes } from "../text/inlineNodes";

export const deleteBackwardCommand: Command = {
  id: "core.deleteBackward",
  run({ state }) {
    const sel = state.selection;
    if (!sel || sel.kind !== "text") return null;

    const blocks = state.document.blocks;
    const blockIndex = blocks.findIndex(b => b.id === sel.blockId);
    if (blockIndex < 0) return null;

    const block = blocks[blockIndex];
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

    // Cursor at position 0: merge with previous block
    if (start === 0) {
      if (blockIndex === 0) return null;
      const prevBlock = blocks[blockIndex - 1];
      const prevLen = prevBlock.content.map(n => n.value).join("").length;
      const mergedContent = mergeAdjacentNodes([...prevBlock.content, ...block.content]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: prevBlock.id, content: mergedContent },
        { type: "deleteBlock", blockId: block.id },
        { type: "setSelection", selection: { kind: "text", blockId: prevBlock.id, anchor: prevLen, focus: prevLen } }
      ];
      return patches;
    }

    // Normal: delete char before cursor
    const newContent = spliceContent(block.content, start - 1, start, []);
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: newContent },
      { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start - 1, focus: start - 1 } }
    ];
    return patches;
  }
};
