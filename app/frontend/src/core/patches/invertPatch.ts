import type { Patch } from "./Patch";
import type { BlockNode } from "../state/DocumentState";

export function invertPatch(
  patch: Patch,
  prevBlock?: BlockNode,
  prevSelection?: any
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
        index: 0 // index must be supplied by caller
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
      default:
        throw new Error(`Unknown patch type: ${patch.type}`);
  }
}
