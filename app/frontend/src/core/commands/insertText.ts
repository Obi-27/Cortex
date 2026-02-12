import type { Command } from "./Command";
import type { Patch } from "../patches/Patch";

export function createInsertTextCommand(text: string): Command {
  return {
    id: "core.insertText",
    run({ state }) {
      const sel = state.selection;
      if (!sel || sel.kind !== "text") return null;

      const block = state.document.blocks.find(b => b.id === sel.blockId);
      if (!block) return null;

      const fullText = block.content.map(n => n.value).join("");
      const start = Math.min(sel.anchor, sel.focus);
      const end = Math.max(sel.anchor, sel.focus);

      const newText = fullText.slice(0, start) + text + fullText.slice(end);
      const newPos = start + text.length;

      const patches: Patch[] = [
        {
          type: "updateBlock",
          blockId: block.id,
          content: [{ type: "text", value: newText }]
        },
        {
          type: "setSelection",
          selection: { kind: "text", blockId: block.id, anchor: newPos, focus: newPos }
        }
      ];

      return patches;
    }
  };
}
