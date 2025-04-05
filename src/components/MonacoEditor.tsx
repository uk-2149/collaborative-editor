import { useRef } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const App: React.FC = () => {
    const monacoRef = useRef<typeof monaco | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorWillMount: BeforeMount = (monaco) => {
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // Store the Monaco instance for future use
        monacoRef.current = monaco;
        editorRef.current = editor; 
        editor.focus();
    };

    function showValue() {
        alert(editorRef.current?.getValue());
      }

    return (
        <>
        <button onClick={showValue}>Show value</button>
        <Editor
            height="90vh"
            width="90vw"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
        />
        </>
    );
};

export default App;
