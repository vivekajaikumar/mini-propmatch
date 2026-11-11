
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Property } from "../types/property";

export function PropertyDetails() {
    const { id } = useParams<{ id: string }>();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setProperty(null);

        api.get<Property>(`/properties/${id}`)
            .then((response) => {
                if (active) {
                    setProperty(response.data);
                }
            })
            .catch(() => {
                if (active) {
                    setError("Property not found or failed to load.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [id]);

    return (
        <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
            <Link
                to="/#properties"
                className="mb-10 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-green-400"
            >
                ← Back to properties
            </Link>

            {loading && (
                <p className="text-gray-400">
                    Loading property...
                </p>
            )}

            {error && (
                <p role="alert" className="text-red-400">
                    {error}
                </p>
            )}

            {!loading && !error && property && (
                <article>
                    <div className="mb-8">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <p className="font-mono text-xs tracking-widest text-green-500">
                                PROPERTY / {property.id}
                            </p>

                            <Link
                                to={`/properties/${property.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-5 py-2.5 text-sm font-semibold text-green-400 transition-colors hover:border-green-400 hover:bg-green-500/10"
                            >
                                <span aria-hidden="true">✎</span>
                                Edit Property
                            </Link>
                        </div>

                        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
                            {property.title}
                        </h1>

                        <p className="text-lg text-gray-400">
                            {property.location}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10">
                        <img
                            src={property.imageUrl}
                            alt={property.title}
                            className="h-80 w-full object-cover md:h-125"
                        />
                    </div>

                    <div className="mt-10 grid gap-8 lg:grid-cols-3">
                        <section className="lg:col-span-2">
                            <h2 className="mb-5 text-2xl font-semibold">
                                Property overview
                            </h2>

                            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <p className="mb-2 text-sm text-gray-400">
                                            Location
                                        </p>

                                        <p className="font-medium">
                                            {property.location}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-sm text-gray-400">
                                            Listing ID
                                        </p>

                                        <p className="font-medium">
                                            #{property.id}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <aside className="h-fit rounded-xl border border-green-500/20 bg-slate-900 p-6">
                            <p className="mb-2 text-sm text-gray-400">
                                Asking price
                            </p>

                            <p className="mb-6 text-3xl font-bold text-green-500">
                                ₹{property.price.toLocaleString("en-IN")}
                            </p>

                            <button
                                type="button"
                                disabled
                                className="w-full cursor-not-allowed rounded-lg bg-green-500 px-6 py-3 font-semibold text-black opacity-60"
                            >
                                Contact agent
                            </button>

                            <p className="mt-3 text-center text-xs text-gray-500">
                                Contact functionality coming soon
                            </p>
                        </aside>
                    </div>
                </article>
            )}
        </main>
    );
}
