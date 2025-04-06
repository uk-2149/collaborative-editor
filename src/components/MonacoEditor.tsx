import { useState, useRef, useEffect } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import axios from "axios";

const MonacoEditor: React.FC = () => {
  const monacoRef = useRef<typeof monaco | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, setOutput] = useState<string>("// Output will appear here");
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{ language: string, version: string } | null>(null);


  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get("https://emkc.org/api/v2/piston/runtimes");
        setLanguages(response.data);
        const defaultLang = response.data.find((lang: any) => lang.language === "javascript");
        setSelectedLanguage(defaultLang || response.data[0]);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (editorRef.current && selectedLanguage) {
        const monacoLang = selectedLanguage.language === "c++" ? "cpp" : selectedLanguage.language;
      if (monacoLang) {
        monaco.editor.setModelLanguage(editorRef.current.getModel()!, monacoLang);
      }
    }
  }, [selectedLanguage]);

  const runCode = async () => {
    const code = editorRef.current?.getValue();

    if (!code) {
      alert("Editor is empty!");
      return;
    }

    const payload = {
        language: selectedLanguage?.language,
        version: selectedLanguage?.version,
        files: [{ content: code }],
      };
      

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;

      if (data.run) {
        const result = data.run.stdout || data.run.stderr || "No output";
        setOutput(result);
      } else {
        console.warn("Unexpected response:", data);
        setOutput("// Error: Unexpected response");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.message);
        if (error.response) {
          console.error("Response Data:", error.response.data);
          setOutput(`Execution failed: ${error.response.data.message || error.message}`);
        }
      } else {
        console.error("Unexpected Error:", error);
        setOutput("An unexpected error occurred.");
      }
    }
  };
  

  return (
    <div>
        <div className="flex justify-between items-start w-[60%] mb-5 px-2 mt-10">

          <div className="flex items-center gap-3">
            <label htmlFor="language" className="text-base font-medium text-white">
              Select Language:
            </label>
            <select
              id="language"
              value={selectedLanguage?.language || ""}
              onChange={(e) => {
                const lang = languages.find((lang) => lang.language === e.target.value);
                if (lang) setSelectedLanguage(lang);
              }}
              className="bg-gray-800 text-white border border-gray-600 px-3 py-1 rounded-md"
            >
              {languages.map((lang) => (
                <option key={`${lang.language}-${lang.version}`} value={lang.language}>
                  {lang.language} ({lang.version})
                </option>
              ))}
            </select>
          </div>
          
          <button
            className="rounded-md border border-transparent px-4 py-2 text-base font-medium bg-[#1a1a1a] cursor-pointer transition-colors duration-200 hover:border-[#646cff] focus:outline focus:outline-4 focus:outline-blue-500 text-[#ededed] mt-1"
            onClick={runCode}
          >
            Run Code
          </button>
        </div>


      <div className="flex h-[90vh] w-full">
        <div className="flex-grow w-[60%]">
          <Editor
            className="bg-[#ffffff] text-[#213547]"
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Write your code here"
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
          />
        </div>
        <div className="bg-black text-white w-[40%] h-full p-4 overflow-auto">
          <h2 className="font-bold mb-2">Output:</h2>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditor;
