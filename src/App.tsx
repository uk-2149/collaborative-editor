import MonacoEditor from "./components/MonacoEditor";

const App: React.FC = () => {
    return (
        <div style={{ padding: "20px" }} className="bg-[#454545]">
            <h1 className="text-center font-bold text-3xl text-[#cfcfcf]">Monaco Editor in Vite</h1>
            <MonacoEditor />
        </div>
    );
};

export default App;
