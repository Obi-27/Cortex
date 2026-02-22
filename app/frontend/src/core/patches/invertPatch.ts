import type { Patch } from "./Patch";
import type { BlockNode, MarkType } from "../state/DocumentState";
import type { SelectionState } from "../state/SelectionState";

export function invertPatch(
  patch: Patch,
  prevBlock?: BlockNode,
  prevBlockIndex?: number,
  prevSelection?: SelectionState,
  prevStoredMarks?: MarkType[] | null
): Patch {
  switch (patch.type) {
    case "insertBlock":
      return {
        type: "deleteBlock",
        blockId: patch.block.id
      };

    case "deleteBlock":
      if (!prevBlock) {
        throw new Error("Missing previous block for inversion");
      }
      return {
        type: "insertBlock",
        block: prevBlock,
        index: prevBlockIndex ?? 0
      };

    case "updateBlock":
      if (!prevBlock) {
        throw new Error("Missing previous block for inversion");
      }
      return {
        type: "updateBlock",
        blockId: patch.blockId,
        content: prevBlock.content
      };

    case "setSelection":
      return {
        type: "setSelection",
        selection: prevSelection ?? null
      };

    case "setStoredMarks":
      return {
        type: "setStoredMarks",
        marks: prevStoredMarks ?? null
      };

    default:
      throw new Error(`Unknown patch type: ${(patch as Patch).type}`);
  }
}
