import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import type { MarkType, InlineNode } from "../state/DocumentState";
import { sliceContent, mergeAdjacentNodes, flattenContent, marksAt } from "../text/inlineNodes";

export function createToggleMarkCommand(mark: MarkType): Command {
  return {
    id: `core.toggleMark.${mark}`,
    run({ state }) {
      const sel = state.selection;
      if (!sel || sel.kind !== "text") return null;

      const block = state.document.blocks.find(b => b.id === sel.blockId);
      if (!block) return null;

      const start = Math.min(sel.anchor, sel.focus);
      const end = Math.max(sel.anchor, sel.focus);

      // Collapsed selection: toggle mark in storedMarks
      if (start === end) {
        const current = state.storedMarks ?? marksAt(block.content, start);
        const hasMark = current.includes(mark);
        const next = hasMark
          ? current.filter(m => m !== mark)
          : [...current, mark];
        return { type: "setStoredMarks" as const, marks: next };
      }

      const totalLen = flattenContent(block.content).length;
      const before = start > 0 ? sliceContent(block.content, 0, start) : [];
      const selected = sliceContent(block.content, start, end);
      const after = end < totalLen ? sliceContent(block.content, end, totalLen) : [];

      // Check if all selected text already has the mark
      const allHaveMark = selected.every(n => n.marks?.includes(mark));

      const toggled: InlineNode[] = selected.map(n => {
        const marks = n.marks?.length ? [...n.marks] : [];
        if (allHaveMark) {
          // Remove mark
          const filtered = marks.filter(m => m !== mark);
          return { type: "text" as const, value: n.value, marks: filtered.length ? filtered : undefined };
        } else {
          // Add mark
          if (!marks.includes(mark)) marks.push(mark);
          return { type: "text" as const, value: n.value, marks };
        }
      });

      const newContent = mergeAdjacentNodes([...before, ...toggled, ...after]);

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: newContent },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: start, focus: end } }
      ];

      return patches;
    }
  };
}
