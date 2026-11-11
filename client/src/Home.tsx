
import type { Property } from "./types/property";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "./api/client";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { PropertyCard } from "./components/PropertyCard";
import { Reveal } from "./components/Reveal";

type PaginatedProperties = {
    data: Property[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
};

// Use 1 for testing with our two properties.
// Change to 6 or 10 when we have more listings.
const PAGE_SIZE = 1;

function Home() {
    const location = useLocation();

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const propertiesRef = useCallback(
        (element: HTMLElement | null) => {
            if (!element || location.hash !== "#properties") return;

            element.scrollIntoView({
                behavior: "instant",
                block: "start",
            });
        },
        [location.hash, location.key]
    );

    // Debounce search input.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch paginated results from Express.
    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError("");

        api
            .get<PaginatedProperties>("/properties", {
                params: {
                    search: debouncedSearch.trim() || undefined,
                    maxPrice: maxPrice || undefined,
                    sort: sortBy,
                    page,
                    limit: PAGE_SIZE,
                },
                signal: controller.signal,
            })
            .then((response) => {
                if (controller.signal.aborted) return;

                setProperties(response.data.data);
                setTotal(response.data.total);
                setTotalPages(response.data.totalPages);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;

                console.error("Failed to load properties:", err);
                setError("Failed to load properties");
                setProperties([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [debouncedSearch, maxPrice, sortBy, page]);

    const formatIndianPrice = (value: string) => {
        if (!value) return "";
        return Number(value).toLocaleString("en-IN");
    };

    const handlePriceChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, "");

        setMaxPrice(
            digitsOnly.replace(/^0+(?=\d)/, "")
        );

        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setPage(1);
    };

    const changePage = (newPage: number) => {
        if (
            newPage < 1 ||
            newPage > totalPages ||
            loading
        ) {
            return;
        }

        setPage(newPage);

        document.getElementById("properties")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <>
            <Navbar />
            <Hero />

            <main className="border-b border-white/10">
                <div className="mx-auto w-full max-w-[1400px] border-x border-white/10 px-5 py-12 md:w-[85%] md:px-10 md:py-16 lg:px-16">
                    <section
                        id="properties"
                        ref={propertiesRef}
                        className="scroll-mt-6"
                    >
                        <Reveal>
                            <p className="mb-3 font-mono text-xs tracking-widest text-green-500">
                                01 / EXPLORE PROPERTIES
                            </p>

                            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                                Explore{" "}
                                <span className="text-green-500">
                  properties.
                </span>
                            </h2>

                            <p className="mb-8 text-sm text-gray-400 md:text-base">
                                Discover properties that match your lifestyle.
                            </p>
                        </Reveal>

                        <div className="mb-7 grid gap-3 md:grid-cols-3">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                placeholder="Search by name or location..."
                                aria-label="Search properties"
                                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500"
                            />

                            <div className="relative">
                                {maxPrice !== "" && (
                                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-green-500">
                    ₹
                  </span>
                                )}

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatIndianPrice(maxPrice)}
                                    onChange={(e) =>
                                        handlePriceChange(e.target.value)
                                    }
                                    placeholder="Maximum price in ₹"
                                    aria-label="Maximum property price"
                                    className={`w-full rounded-lg border border-white/10 bg-slate-900 py-3 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500 ${
                                        maxPrice !== "" ? "pl-8" : "pl-4"
                                    }`}
                                />
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                                aria-label="Sort properties"
                                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-green-500"
                            >
                                <option value="default">
                                    Sort: Default
                                </option>
                                <option value="low-to-high">
                                    Price: Low to High
                                </option>
                                <option value="high-to-low">
                                    Price: High to Low
                                </option>
                            </select>
                        </div>

                        {loading && (
                            <p className="text-sm text-gray-400">
                                Loading properties...
                            </p>
                        )}

                        {error && (
                            <p role="alert" className="text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        {!loading && !error && properties.length === 0 && (
                            <p className="text-sm text-gray-400">
                                No properties found.
                            </p>
                        )}

                        {!loading && !error && properties.length > 0 && (
                            <>
                                <p className="mb-5 text-xs text-gray-400">
                                    Showing{" "}
                                    {(page - 1) * PAGE_SIZE + 1}–
                                    {Math.min(page * PAGE_SIZE, total)}{" "}
                                    of {total} properties
                                </p>

                                <div className="grid gap-5 md:grid-cols-2">
                                    {properties.map((property) => (
                                        <Reveal key={property.id}>
                                            <PropertyCard property={property} />
                                        </Reveal>
                                    ))}
                                </div>
                            </>
                        )}

                        {!loading && !error && totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => changePage(page - 1)}
                                    disabled={page === 1}
                                    className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <span className="font-mono text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>

                                <button
                                    type="button"
                                    onClick={() => changePage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

export default Home;
