import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";
import { spliceContent, marksAt } from "../text/inlineNodes";
import type { InlineNode } from "../state/DocumentState";
import { isCollapsed } from "../selection/selectionHelpers";
import { deleteSelectedRange } from "../selection/deleteRange";

export function createInsertTextCommand(text: string): Command {
  return {
    id: "core.insertText",
    run({ state }) {
      const sel = state.selection;
      if (!sel || sel.kind !== "text") return null;

      // Cross-block or ranged selection: delete range first, then insert
      if (!isCollapsed(sel)) {
        const result = deleteSelectedRange(sel, state.document.blocks);
        if (!result) return null;

        // Find the updated block content after range deletion
        // The start block was updated by deleteSelectedRange
        const updatedContent = result.patches.find(
          p => p.type === "updateBlock" && p.blockId === result.cursorBlockId
        );
        if (!updatedContent || updatedContent.type !== "updateBlock") return null;

        const marks = state.storedMarks ?? marksAt(updatedContent.content, result.cursorOffset);
        const insertNode: InlineNode = { type: "text", value: text, marks: marks.length ? marks : undefined };
        const newContent = spliceContent(updatedContent.content, result.cursorOffset, result.cursorOffset, [insertNode]);
        const newPos = result.cursorOffset + text.length;

        // Replace the updateBlock patch with the one that includes the inserted text
        const patches: Patch[] = result.patches.map(p =>
          p.type === "updateBlock" && p.blockId === result.cursorBlockId
            ? { ...p, content: newContent }
            : p
        );
        patches.push({
          type: "setSelection",
          selection: { kind: "text", anchorBlockId: result.cursorBlockId, anchorOffset: newPos, focusBlockId: result.cursorBlockId, focusOffset: newPos }
        });
        return patches;
      }

      const block = state.document.blocks.find(b => b.id === sel.anchorBlockId);
      if (!block) return null;

      const marks = state.storedMarks ?? marksAt(block.content, sel.anchorOffset);
      const insertNode: InlineNode = { type: "text", value: text, marks: marks.length ? marks : undefined };
      const newContent = spliceContent(block.content, sel.anchorOffset, sel.anchorOffset, [insertNode]);
      const newPos = sel.anchorOffset + text.length;

      const patches: Patch[] = [
        { type: "updateBlock", blockId: block.id, content: newContent },
        { type: "setSelection", selection: { kind: "text", anchorBlockId: block.id, anchorOffset: newPos, focusBlockId: block.id, focusOffset: newPos } }
      ];

      return patches;
    }
  };
}
