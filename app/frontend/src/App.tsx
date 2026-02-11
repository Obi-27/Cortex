import { EditorProvider } from "./editor/EditorProvider";
import { EditorView } from "./editor/EditorView";

function App() {
  return (
    <EditorProvider>
      <EditorView />
    </EditorProvider>
  );
}

export default App;
