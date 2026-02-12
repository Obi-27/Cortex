import type { TextSelection } from "../../core/state/SelectionState";

function findBlockId(node: Node): string | null {
  let el: HTMLElement | null = node instanceof HTMLElement ? node : node.parentElement;
  while (el) {
    if (el.dataset.blockId) return el.dataset.blockId;
    el = el.parentElement;
  }
  return null;
}

function getCharOffset(blockEl: HTMLElement, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
  let offset = 0;

  let textNode: Text | null;
  while ((textNode = walker.nextNode() as Text | null)) {
    if (textNode === targetNode) {
      // If this text node is a ZWNBSP placeholder, treat offset as 0
      if (textNode.data === "\uFEFF") return 0;
      return offset + targetOffset;
    }
    // Don't count ZWNBSP placeholder characters
    if (textNode.data === "\uFEFF") continue;
    offset += textNode.length;
  }

  return offset;
}

export function readSelectionFromDOM(): TextSelection | null {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.anchorNode || !sel.focusNode) return null;

  const anchorBlockId = findBlockId(sel.anchorNode);
  const focusBlockId = findBlockId(sel.focusNode);

  // Only handle single-block text selections for now
  if (!anchorBlockId || anchorBlockId !== focusBlockId) return null;

  const blockEl = document.querySelector(`[data-block-id="${anchorBlockId}"]`) as HTMLElement | null;
  if (!blockEl) return null;

  const anchor = getCharOffset(blockEl, sel.anchorNode, sel.anchorOffset);
  const focus = getCharOffset(blockEl, sel.focusNode, sel.focusOffset);

  return {
    kind: "text",
    blockId: anchorBlockId,
    anchor,
    focus
  };
}
