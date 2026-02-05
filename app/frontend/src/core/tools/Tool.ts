import type { EditorState } from "../state/EditorState";
import type { Command } from "../commands/Command";
import type { EditorInputEvent } from "../tools/EditorInputEvent";

export interface ToolContext {
  state: EditorState;
}

export interface Tool {
  id: string;

  /**
   * Whether this tool is relevant for the current state.
   * Relevant tools get input priority.
   */
  isRelevant(state: EditorState): boolean;

  /**
   * Optional input interception.
   * Return a Command to consume input, or null to pass.
   */
  interceptInput?(
    event: EditorInputEvent,
    ctx: ToolContext
  ): Command | null;
}
