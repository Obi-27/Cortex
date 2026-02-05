import { ToolManager } from "../../core/tools/ToolManager";
import { dispatchCommand } from "../../core/commands/dispatcher";
import type { EditorInputEvent } from "../../core/tools/EditorInputEvent";
import type { EditorState } from "../../core/state/EditorState";

export function handleKeyDown(
  event: KeyboardEvent,
  state: EditorState,
  toolManager: ToolManager,
  setState: (s: EditorState) => void
) {
  const input: EditorInputEvent = {
    kind: "key",
    key: event.key,
    shift: event.shiftKey,
    meta: event.metaKey,
    ctrl: event.ctrlKey,
    alt: event.altKey
  };

  const command = toolManager.interceptInput(input, state);
  if (!command) return;

  event.preventDefault();

  const next = dispatchCommand(state, command);
  setState(next);
}
