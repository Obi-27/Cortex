import type { Command } from "./Command";
import type { BlockNode } from "../state/DocumentState";
import type { Patch } from "../patches/Patch";
import { sliceContent, flattenContent } from "../text/inlineNodes";
import { isCollapsed } from "../selection/selectionHelpers";
import { deleteSelectedRange } from "../selection/deleteRange";

export const insertParagraphCommand: Command = {
  id: "core.insertParagraph",
  run({ state }) {
    const sel = state.selection;

    // Cursor-aware split
    if (sel && sel.kind === "text") {
      const blocks = state.document.blocks;

      // Range selection: delete range first, then split at cursor
      if (!isCollapsed(sel)) {
        const result = deleteSelectedRange(sel, blocks);
        if (!result) return null;

        // Find updated content for the cursor block
        const updatedPatch = result.patches.find(
          p => p.type === "updateBlock" && p.blockId === result.cursorBlockId
        );
        if (!updatedPatch || updatedPatch.type !== "updateBlock") return null;

        const content = updatedPatch.content;
        const totalLen = flattenContent(content).length;
        const contentBefore = sliceContent(content, 0, result.cursorOffset);
        const contentAfter = sliceContent(content, result.cursorOffset, totalLen);

        const newBlock: BlockNode = {
          id: crypto.randomUUID(),
          type: "paragraph",
          content: contentAfter
        };

        // Find the index of cursorBlock after deletions have been applied
        // We need to figure out which blocks remain. The start block is always kept.
        // Count how many blocks before cursorBlock survive.
        const deletedIds = new Set(
          result.patches.filter(p => p.type === "deleteBlock").map(p => (p as { blockId: string }).blockId)
        );
        const survivingBlocks = blocks.filter(b => !deletedIds.has(b.id));
        const cursorBlockIndex = survivingBlocks.findIndex(b => b.id === result.cursorBlockId);

        // Replace the updateBlock patch with truncated content
        const patches: Patch[] = result.patches.map(p =>
          p.type === "updateBlock" && p.blockId === result.cursorBlockId
            ? { ...p, content: contentBefore }
            : p
        );

        patches.push(
          { type: "insertBlock", block: newBlock, index: cursorBlockIndex + 1 },
          { type: "setSelection", selection: { kind: "text", anchorBlockId: newBlock.id, anchorOffset: 0, focusBlockId: newBlock.id, focusOffset: 0 } }
        );

        return patches;
      }

      const blockIndex = blocks.findIndex(b => b.id === sel.anchorBlockId);
      if (blockIndex < 0) return null;

      const block = blocks[blockIndex];
      const totalLen = flattenContent(block.content).length;

      const contentBefore = sliceContent(block.content, 0, sel.anchorOffset);
      const contentAfter = sliceContent(block.content, sel.anchorOffset, totalLen);

      const newBlock: BlockNode = {
        id: crypto.randomUUID(),
        type: "paragraph",
        content: contentAfter
      };

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: contentBefore },
        { type: "insertBlock", block: newBlock, index: blockIndex + 1 },
        { type: "setSelection", selection: { kind: "text", anchorBlockId: newBlock.id, anchorOffset: 0, focusBlockId: newBlock.id, focusOffset: 0 } }
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
      { type: "insertBlock", block, index },
      { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: 0, focusBlockId: block.id, focusOffset: 0 } }
    ];
  }
};
