import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { createEditorState } from "./core/state/createEditorState";
import { applyPatch } from "./core/patches/applyPatch";

const state = createEditorState();

const next = applyPatch(state, {
  type: "insertBlock",
  index: 1,
  block: {
    id: "block-2",
    type: "paragraph",
    content: [{ type: "text", value: "Second block" }]
  }
});

console.log(next.document.blocks);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
