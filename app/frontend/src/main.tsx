import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { createEditorState } from "./core/state/createEditorState";
import { dispatchCommand } from "./core/commands/dispatcher";
import { insertParagraphCommand } from "./core/commands/insertParagraph";

let state = createEditorState();

state = dispatchCommand(state, insertParagraphCommand);
state = dispatchCommand(state, insertParagraphCommand);

console.log(state.document.blocks.length); // 3
console.log(state.history.past.length);    // 2

import { ToolManager } from "./core/tools/ToolManager";
import { CoreEditingTool } from "./tools/core/CoreEditingTool";

export const toolManager = new ToolManager();
toolManager.register(CoreEditingTool);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
