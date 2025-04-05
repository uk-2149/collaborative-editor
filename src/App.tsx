import MonacoEditor from "./components/MonacoEditor";

const App: React.FC = () => {
    return (
        <div style={{ padding: "20px" }}>
            <h1>Monaco Editor in Vite</h1>
            <MonacoEditor />
        </div>
    );
};

export default App;
