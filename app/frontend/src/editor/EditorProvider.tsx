import { createContext, useContext, useMemo, useReducer } from "react";
import type { EditorState } from "../core/state/EditorState";
import { createEditorState } from "../core/state/createEditorState";
import type { Command } from "../core/commands/Command";
import { dispatchCommand } from "../core/commands/dispatcher";
import type { Tool } from "../core/tools/Tool";
import { ToolManager } from "../core/tools/ToolManager";
import { KeyboardShortcutsTool } from "../tools/core/KeyboardShortcutsTool";
import { CoreEditingTool } from "../tools/core/CoreEditingTool";

const defaultTools: Tool[] = [KeyboardShortcutsTool, CoreEditingTool];

interface EditorProviderProps {
  tools?: Tool[];
  children: React.ReactNode;
}

interface EditorContextValue {
  state: EditorState;
  dispatch: (command: Command) => void;
  toolManager: ToolManager;
}

const EditorContext = createContext<EditorContextValue | null>(null);

function editorReducer(state: EditorState, command: Command): EditorState {
  return dispatchCommand(state, command);
}

export function EditorProvider({ tools = defaultTools, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createEditorState);
  const toolManager = useMemo(() => new ToolManager(tools), [tools]);

  return (
    <EditorContext.Provider value={{ state, dispatch, toolManager }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used inside EditorProvider");
  }
  return ctx;
}
