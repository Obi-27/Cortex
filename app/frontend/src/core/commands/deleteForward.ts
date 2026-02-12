import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";

export const deleteForwardCommand: Command = {
  id: "core.deleteForward",
  run({ state }) {
    const sel = state.selection;
    if (!sel || sel.kind !== "text") return null;

    const blocks = state.document.blocks;
    const blockIndex = blocks.findIndex(b => b.id === sel.blockId);
    if (blockIndex < 0) return null;

    const block = blocks[blockIndex];
    const fullText = block.content.map(n => n.value).join("");
    const start = Math.min(sel.anchor, sel.focus);
    const end = Math.max(sel.anchor, sel.focus);

    // Range selection: delete the selected range
    if (start !== end) {
      const newText = fullText.slice(0, start) + fullText.slice(end);
      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: [{ type: "text", value: newText }] },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
      ];
      return patches;
    }

    // Cursor at end: merge with next block
    if (start >= fullText.length) {
      if (blockIndex >= blocks.length - 1) return null;
      const nextBlock = blocks[blockIndex + 1];
      const nextText = nextBlock.content.map(n => n.value).join("");
      const mergedText = fullText + nextText;

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: [{ type: "text", value: mergedText }] },
        { type: "deleteBlock", blockId: nextBlock.id },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
      ];
      return patches;
    }

    // Normal: delete char after cursor
    const newText = fullText.slice(0, start) + fullText.slice(start + 1);
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: [{ type: "text", value: newText }] },
      { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: start } }
    ];
    return patches;
  }
};
