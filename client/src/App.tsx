import { useEffect, useState } from "react";
import { api } from "./api/client";

function App() {
    const [message, setMessage] = useState("Connecting to backend...");

    useEffect(() => {
        api
            .get<{ status: string; message: string }>("/health")
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch(() => {
                setMessage("Failed to connect to backend");
            });
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-900">
            <h1 className="text-3xl font-bold text-white">{message}</h1>
        </main>
    );
}

export default App;