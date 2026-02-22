import type { TextSelection } from "../state/SelectionState";
import type { BlockNode } from "../state/DocumentState";
import type { Patch } from "../patches/Patch";
import { sliceContent, mergeAdjacentNodes, flattenContent } from "../text/inlineNodes";
import { getOrderedRange, isSingleBlock } from "./selectionHelpers";

export interface DeleteRangeResult {
  patches: Patch[];
  cursorBlockId: string;
  cursorOffset: number;
}

/**
 * Produces patches that delete the selected range (single-block or cross-block).
 * Returns the patches and the cursor position after deletion.
 */
export function deleteSelectedRange(
  sel: TextSelection,
  blocks: BlockNode[]
): DeleteRangeResult | null {
  const range = getOrderedRange(sel, blocks);
  if (range.startBlockIndex < 0 || range.endBlockIndex < 0) return null;

  // Single-block range deletion
  if (isSingleBlock(sel)) {
    const block = blocks[range.startBlockIndex];
    const newContent = sliceContent(block.content, 0, range.startOffset)
      .concat(sliceContent(block.content, range.endOffset, flattenContent(block.content).length));
    const merged = mergeAdjacentNodes(newContent);

    return {
      patches: [{ type: "updateBlock", blockId: block.id, content: merged }],
      cursorBlockId: block.id,
      cursorOffset: range.startOffset,
    };
  }

  // Cross-block range deletion:
  // 1. Keep content before selection in start block
  // 2. Keep content after selection in end block, append to start block
  // 3. Delete all blocks from start+1 through end (inclusive)
  const startBlock = blocks[range.startBlockIndex];
  const endBlock = blocks[range.endBlockIndex];

  const beforeContent = sliceContent(startBlock.content, 0, range.startOffset);
  const endLen = flattenContent(endBlock.content).length;
  const afterContent = sliceContent(endBlock.content, range.endOffset, endLen);
  const mergedContent = mergeAdjacentNodes([...beforeContent, ...afterContent]);

  const patches: Patch[] = [
    { type: "updateBlock", blockId: startBlock.id, content: mergedContent },
  ];

  // Delete blocks from end to start+1 (reverse order to preserve indices)
  for (let i = range.endBlockIndex; i > range.startBlockIndex; i--) {
    patches.push({ type: "deleteBlock", blockId: blocks[i].id });
  }

  return {
    patches,
    cursorBlockId: startBlock.id,
    cursorOffset: range.startOffset,
  };
}
