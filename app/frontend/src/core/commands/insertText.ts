import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, marksAt } from "../text/inlineNodes";
import type { InlineNode } from "../state/DocumentState";

export function createInsertTextCommand(text: string): Command {
  return {
    id: "core.insertText",
    run({ state }) {
      const sel = state.selection;
      if (!sel || sel.kind !== "text") return null;

      const block = state.document.blocks.find(b => b.id === sel.blockId);
      if (!block) return null;

      const start = Math.min(sel.anchor, sel.focus);
      const end = Math.max(sel.anchor, sel.focus);

      const marks = state.storedMarks ?? marksAt(block.content, start);
      const insertNode = { type: "text" as const, value: text, marks: marks.length ? marks : undefined } as InlineNode;
      const newContent = spliceContent(block.content, start, end, [insertNode]);
      const newPos = start + text.length;

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: newContent },
        { type: "setSelection", selection: { kind: "text", blockId: block.id, anchor: newPos, focus: newPos } }
      ];

      return patches;
    }
  };
}
