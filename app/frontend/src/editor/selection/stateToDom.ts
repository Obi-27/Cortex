import type { SelectionState } from "../../core/state/SelectionState";

function resolveOffset(blockEl: HTMLElement, charOffset: number): { node: Node; offset: number } | null {
  const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
  let remaining = charOffset;

  let textNode: Text | null;
  while ((textNode = walker.nextNode() as Text | null)) {
    // ZWNBSP placeholder: place caret at offset 0
    if (textNode.data === "\uFEFF") {
      if (remaining === 0) return { node: textNode, offset: 0 };
      continue;
    }

    if (remaining <= textNode.length) {
      return { node: textNode, offset: remaining };
    }
    remaining -= textNode.length;
  }

  // Fallback: place at end of last text node
  const lastWalker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
  let last: Text | null = null;
  let n: Text | null;
  while ((n = lastWalker.nextNode() as Text | null)) { last = n; }
  if (last) {
    return { node: last, offset: last.data === "\uFEFF" ? 0 : last.length };
  }

  return null;
}

export function restoreSelectionToDOM(selection: SelectionState): void {
  if (!selection || selection.kind !== "text") return;

  const anchorBlockEl = document.querySelector(`[data-block-id="${selection.anchorBlockId}"]`) as HTMLElement | null;
  const focusBlockEl = selection.anchorBlockId === selection.focusBlockId
    ? anchorBlockEl
    : document.querySelector(`[data-block-id="${selection.focusBlockId}"]`) as HTMLElement | null;

  if (!anchorBlockEl || !focusBlockEl) return;

  const anchorPos = resolveOffset(anchorBlockEl, selection.anchorOffset);
  const focusPos = resolveOffset(focusBlockEl, selection.focusOffset);
  if (!anchorPos || !focusPos) return;

  const sel = document.getSelection();
  if (!sel) return;

  sel.setBaseAndExtent(anchorPos.node, anchorPos.offset, focusPos.node, focusPos.offset);
}
