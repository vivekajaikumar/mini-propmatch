import { useEffect, useState } from "react";
import { api } from "./api/client";

type Property = {
    id: number;
    title: string;
    price: number;
    location: string;
};

function App() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .get<Property[]>("/properties")
            .then((response) => {
                setProperties(response.data);
            })
            .catch(() => {
                setError("Failed to load properties");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading properties...</p>;
    if (error) return <p>{error}</p>;

    return (
        <main className="min-h-screen bg-slate-900 p-8 text-white">
            <h1 className="mb-6 text-3xl font-bold">Mini PropMatch</h1>

            {properties.map((property) => (
                <article key={property.id} className="mb-4 rounded-lg bg-slate-800 p-4">
                    <h2 className="text-xl font-semibold">{property.title}</h2>
                    <p>{property.location}</p>
                    <p>₹{property.price.toLocaleString("en-IN")}</p>
                </article>
            ))}
        </main>
    );
}

export default App;