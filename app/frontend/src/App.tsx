import { EditorProvider } from "./editor/EditorProvider";
import { EditorView } from "./editor/EditorView";
import { ActiveMarksBar } from "./editor/ActiveMarksBar";

function App() {
  return (
    <EditorProvider>
      <ActiveMarksBar />
      <EditorView />
    </EditorProvider>
  );
}

export default App;
