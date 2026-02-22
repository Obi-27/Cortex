import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, mergeAdjacentNodes } from "../text/inlineNodes";
import { isCollapsed } from "../selection/selectionHelpers";
import { deleteSelectedRange } from "../selection/deleteRange";

export const deleteBackwardCommand: Command = {
  id: "core.deleteBackward",
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

    // Cursor at position 0: merge with previous block
    if (sel.anchorOffset === 0) {
      if (blockIndex === 0) return null;
      const prevBlock = blocks[blockIndex - 1];
      const prevLen = prevBlock.content.map(n => n.value).join("").length;
      const mergedContent = mergeAdjacentNodes([...prevBlock.content, ...block.content]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: prevBlock.id, content: mergedContent },
        { type: "deleteBlock", blockId: block.id },
        { type: "setSelection", selection: { kind: "text", anchorBlockId: prevBlock.id, anchorOffset: prevLen, focusBlockId: prevBlock.id, focusOffset: prevLen } }
      ];
      return patches;
    }

    // Normal: delete char before cursor
    const newContent = spliceContent(block.content, sel.anchorOffset - 1, sel.anchorOffset, []);
    const newPos = sel.anchorOffset - 1;
    const patches: Patch[] = [
      { type: "updateBlock", blockId: block.id, content: newContent },
      { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: newPos, focusBlockId: block.id, focusOffset: newPos } }
    ];
    return patches;
  }
};
