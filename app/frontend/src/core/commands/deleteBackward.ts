import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";

export const deleteBackwardCommand: Command = {
  id: "core.deleteBackward",
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

    // Cursor at position 0: merge with previous block
    if (start === 0) {
      if (blockIndex === 0) return null;
      const prevBlock = blocks[blockIndex - 1];
      const prevText = prevBlock.content.map(n => n.value).join("");
      const mergedText = prevText + fullText;
      const cursorPos = prevText.length;

      const patches: Patch[] = [
        { type: "updateBlock", blockId: prevBlock.id, content: [{ type: "text", value: mergedText }] },
        { type: "deleteBlock", blockId: block.id },
        { type: "setSelection", selection: { kind: "text", blockId: prevBlock.id, anchor: cursorPos, focus: cursorPos } }
      ];
      return patches;
    }

    // Normal: delete char before cursor
    const newText = fullText.slice(0, start - 1) + fullText.slice(start);
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: [{ type: "text", value: newText }] },
      { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start - 1, focus: start - 1 } }
    ];
    return patches;
  }
};
