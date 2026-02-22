import type { Tool } from "./Tool";
import type { EditorState } from "../state/EditorState";
import type { Command } from "../commands/Command";
import type { EditorInputEvent } from "./EditorInputEvent";

export class ToolManager {
  private tools: Tool[];

  constructor(tools: Tool[] = []) {
    this.tools = [...tools];
  }

  getActiveTools(state: EditorState): Tool[] {
    return this.tools.filter(tool =>
      tool.isRelevant(state)
    );
  }

  interceptInput(
    event: EditorInputEvent,
    state: EditorState
  ): Command | null {
    const activeTools = this.getActiveTools(state);

    for (const tool of activeTools) {
      if (!tool.interceptInput) continue;

      const command = tool.interceptInput(event, { state });
      if (command) {
        return command;
      }
    }

    return null;
  }
}
