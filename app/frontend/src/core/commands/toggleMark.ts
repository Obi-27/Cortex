import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import type { MarkType, InlineNode } from "../state/DocumentState";
import { sliceContent, mergeAdjacentNodes, flattenContent, marksAt } from "../text/inlineNodes";
import { isCollapsed, isSingleBlock } from "../selection/selectionHelpers";

export function createToggleMarkCommand(mark: MarkType): Command {
  return {
    id: `core.toggleMark.${mark}`,
    run({ state }) {
      const sel = state.selection;
      if (!sel || sel.kind !== "text") return null;

      // Collapsed selection: toggle mark in storedMarks
      if (isCollapsed(sel)) {
        const block = state.document.blocks.find(b => b.id === sel.anchorBlockId);
        if (!block) return null;
        const current = state.storedMarks ?? marksAt(block.content, sel.anchorOffset);
        const hasMark = current.includes(mark);
        const next = hasMark
          ? current.filter(m => m !== mark)
          : [...current, mark];
        return { type: "setStoredMarks" as const, marks: next };
      }

      // Only single-block mark toggling for now
      if (!isSingleBlock(sel)) return null;

      const block = state.document.blocks.find(b => b.id === sel.anchorBlockId);
      if (!block) return null;

      const start = Math.min(sel.anchorOffset, sel.focusOffset);
      const end = Math.max(sel.anchorOffset, sel.focusOffset);

      const totalLen = flattenContent(block.content).length;
      const before = start > 0 ? sliceContent(block.content, 0, start) : [];
      const selected = sliceContent(block.content, start, end);
      const after = end < totalLen ? sliceContent(block.content, end, totalLen) : [];

      // Check if all selected text already has the mark
      const allHaveMark = selected.every(n => n.marks?.includes(mark));

      const toggled: InlineNode[] = selected.map(n => {
        const marks = n.marks?.length ? [...n.marks] : [];
        if (allHaveMark) {
          const filtered = marks.filter(m => m !== mark);
          return { type: "text" as const, value: n.value, marks: filtered.length ? filtered : undefined };
        } else {
          if (!marks.includes(mark)) marks.push(mark);
          return { type: "text" as const, value: n.value, marks };
        }
      });

      const newContent = mergeAdjacentNodes([...before, ...toggled, ...after]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: newContent },
        { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: start, focusBlockId: block.id, focusOffset: end } }
      ];

      return patches;
    }
  };
}
