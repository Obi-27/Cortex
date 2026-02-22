import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, mergeAdjacentNodes, flattenContent } from "../text/inlineNodes";
import { isCollapsed } from "../selection/selectionHelpers";
import { deleteSelectedRange } from "../selection/deleteRange";

export const deleteForwardCommand: Command = {
  id: "core.deleteForward",
  run({ state }) {
    const sel = state.selection;
    if (!sel || sel.kind !== "text") return null;

    const blocks = state.document.blocks;

    // Range selection (single-block or cross-block): delete the range
    if (!isCollapsed(sel)) {
      const result = deleteSelectedRange(sel, blocks);
      if (!result) return null;
      return [
        ...result.patches,
        { type: "setSelection", selection: { kind: "text", anchorBlockId: result.cursorBlockId, anchorOffset: result.cursorOffset, focusBlockId: result.cursorBlockId, focusOffset: result.cursorOffset } } as Patch,
      ];
    }

    const blockIndex = blocks.findIndex(b => b.id === sel.anchorBlockId);
    if (blockIndex < 0) return null;
    const block = blocks[blockIndex];
    const fullText = flattenContent(block.content);

    // Cursor at end: merge with next block
    if (sel.anchorOffset >= fullText.length) {
      if (blockIndex >= blocks.length - 1) return null;
      const nextBlock = blocks[blockIndex + 1];
      const mergedContent = mergeAdjacentNodes([...block.content, ...nextBlock.content]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: mergedContent },
        { type: "deleteBlock", blockId: nextBlock.id },
        { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: sel.anchorOffset, focusBlockId: block.id, focusOffset: sel.anchorOffset } }
      ];
      return patches;
    }

    // Normal: delete char after cursor
    const newContent = spliceContent(block.content, sel.anchorOffset, sel.anchorOffset + 1, []);
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: newContent },
      { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: sel.anchorOffset, focusBlockId: block.id, focusOffset: sel.anchorOffset } }
    ];
    return patches;
  }
};
