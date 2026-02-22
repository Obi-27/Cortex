import { ToolManager } from "../../core/tools/ToolManager";
import type { Command } from "../../core/commands/Command";
import type { BeforeInputEvent } from "../../core/tools/EditorInputEvent";
import type { EditorState } from "../../core/state/EditorState";

export function handleBeforeInput(
  event: InputEvent,
  state: EditorState,
  toolManager: ToolManager,
  dispatch: (command: Command) => void
) {
  event.preventDefault();

  const input: BeforeInputEvent = {
    kind: "beforeinput",
    inputType: event.inputType,
    data: event.data
  };

  const command = toolManager.interceptInput(input, state);
  if (!command) return;

  dispatch(command);
}
