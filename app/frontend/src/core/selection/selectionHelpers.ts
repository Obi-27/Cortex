import type { TextSelection } from "../state/SelectionState";
import type { BlockNode } from "../state/DocumentState";

export interface OrderedRange {
  startBlockId: string;
  startOffset: number;
  endBlockId: string;
  endOffset: number;
  startBlockIndex: number;
  endBlockIndex: number;
}

export function isSingleBlock(sel: TextSelection): boolean {
  return sel.anchorBlockId === sel.focusBlockId;
}

export function isCollapsed(sel: TextSelection): boolean {
  return sel.anchorBlockId === sel.focusBlockId && sel.anchorOffset === sel.focusOffset;
}

export function getOrderedRange(sel: TextSelection, blocks: BlockNode[]): OrderedRange {
  if (isSingleBlock(sel)) {
    const idx = blocks.findIndex(b => b.id === sel.anchorBlockId);
    const start = Math.min(sel.anchorOffset, sel.focusOffset);
    const end = Math.max(sel.anchorOffset, sel.focusOffset);
    return {
      startBlockId: sel.anchorBlockId,
      startOffset: start,
      endBlockId: sel.anchorBlockId,
      endOffset: end,
      startBlockIndex: idx,
      endBlockIndex: idx,
    };
  }

  const anchorIdx = blocks.findIndex(b => b.id === sel.anchorBlockId);
  const focusIdx = blocks.findIndex(b => b.id === sel.focusBlockId);

  if (anchorIdx <= focusIdx) {
    return {
      startBlockId: sel.anchorBlockId,
      startOffset: sel.anchorOffset,
      endBlockId: sel.focusBlockId,
      endOffset: sel.focusOffset,
      startBlockIndex: anchorIdx,
      endBlockIndex: focusIdx,
    };
  } else {
    return {
      startBlockId: sel.focusBlockId,
      startOffset: sel.focusOffset,
      endBlockId: sel.anchorBlockId,
      endOffset: sel.anchorOffset,
      startBlockIndex: focusIdx,
      endBlockIndex: anchorIdx,
    };
  }
}
