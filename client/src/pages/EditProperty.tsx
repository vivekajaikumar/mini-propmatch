
import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { api } from "../api/client";
import type { Property } from "../types/property";

const propertySchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, "Enter at least 5 characters")
        .max(255, "Title is too long"),

    price: z
        .number()
        .int("Price must be a whole number")
        .positive("Price must be greater than zero")
        .safe("Price is too large"),

    location: z
        .string()
        .trim()
        .min(3, "Enter at least 3 characters")
        .max(255, "Location is too long"),

    imageUrl: z
        .string()
        .trim()
        .max(2000)
        .refine(
            (value) =>
                value.startsWith("/properties/") ||
                value.startsWith("https://"),
            "Enter an HTTPS URL or a /properties/ image path"
        ),
});

type FormErrors = Partial<
    Record<"title" | "price" | "location" | "imageUrl", string>
>;

export function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setLoadError("");
        setErrors({});
        setServerError("");

        api.get<Property>(`/properties/${id}`, {
            signal: controller.signal,
        })
            .then((response) => {
                if (controller.signal.aborted) return;

                const property = response.data;

                setTitle(property.title);
                setPrice(String(property.price));
                setLocation(property.location);
                setImageUrl(property.imageUrl);
            })
            .catch((error) => {
                if (controller.signal.aborted) return;

                console.error("Failed to load property:", error);
                setLoadError(
                    "Property not found or failed to load."
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [id]);

    function handlePriceChange(value: string) {
        const digits = value.replace(/\D/g, "");
        setPrice(digits.replace(/^0+(?=\d)/, ""));
    }

    const formattedPrice = price
        ? Number(price).toLocaleString("en-IN")
        : "";

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (submitting || loading || loadError) return;

        setErrors({});
        setServerError("");

        const result = propertySchema.safeParse({
            title,
            price: price === "" ? 0 : Number(price),
            location,
            imageUrl,
        });

        if (!result.success) {
            const fieldErrors = z.flattenError(
                result.error
            ).fieldErrors;

            setErrors({
                title: fieldErrors.title?.[0],
                price: fieldErrors.price?.[0],
                location: fieldErrors.location?.[0],
                imageUrl: fieldErrors.imageUrl?.[0],
            });

            return;
        }

        setSubmitting(true);

        try {
            const response = await api.patch<Property>(
                `/properties/${id}`,
                result.data
            );

            navigate(`/properties/${response.data.id}`);
        } catch (error) {
            console.error("Failed to update property:", error);
            setServerError(
                "Could not save changes. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500";

    return (
        <main className="min-h-screen border-b border-white/10">
            <div className="mx-auto w-full max-w-350 border-x border-white/10 px-5 py-12 md:w-[85%] md:px-10 md:py-16 lg:px-16">
                <Link
                    to={`/properties/${id}`}
                    className="mb-10 inline-block text-sm text-gray-400 transition-colors hover:text-green-400"
                >
                    ← Back to property
                </Link>

                <div className="mb-10">
                    <p className="mb-3 font-mono text-xs tracking-widest text-green-500">
                        03 / EDIT PROPERTY
                    </p>

                    <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                        Edit your{" "}
                        <span className="text-green-500">
                            property.
                        </span>
                    </h1>

                    <p className="max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
                        Update your property details and save
                        the changes.
                    </p>
                </div>

                {loading && (
                    <p className="text-gray-400">
                        Loading property details...
                    </p>
                )}

                {!loading && loadError && (
                    <p role="alert" className="text-red-400">
                        {loadError}
                    </p>
                )}

                {!loading && !loadError && (
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="max-w-2xl space-y-6 rounded-xl border border-white/10 bg-slate-950 p-5 md:p-8"
                    >
                        <div>
                            <label
                                htmlFor="edit-title"
                                className="mb-2 block text-sm font-medium"
                            >
                                Property title
                            </label>

                            <input
                                id="edit-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={255}
                                aria-invalid={Boolean(errors.title)}
                                aria-describedby={
                                    errors.title
                                        ? "edit-title-error"
                                        : undefined
                                }
                                className={inputClass}
                            />

                            {errors.title && (
                                <p
                                    id="edit-title-error"
                                    className="mt-2 text-xs text-red-400"
                                >
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="edit-price"
                                className="mb-2 block text-sm font-medium"
                            >
                                Asking price (₹)
                            </label>

                            <div className="relative">
                                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-green-500">
                                    ₹
                                </span>

                                <input
                                    id="edit-price"
                                    type="text"
                                    inputMode="numeric"
                                    value={formattedPrice}
                                    onChange={(event) =>
                                        handlePriceChange(
                                            event.target.value
                                        )
                                    }
                                    aria-invalid={Boolean(errors.price)}
                                    aria-describedby={
                                        errors.price
                                            ? "edit-price-error"
                                            : undefined
                                    }
                                    className={`${inputClass} pl-9`}
                                />
                            </div>

                            {errors.price && (
                                <p
                                    id="edit-price-error"
                                    className="mt-2 text-xs text-red-400"
                                >
                                    {errors.price}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="edit-location"
                                className="mb-2 block text-sm font-medium"
                            >
                                Location
                            </label>

                            <input
                                id="edit-location"
                                type="text"
                                value={location}
                                onChange={(event) =>
                                    setLocation(event.target.value)
                                }
                                maxLength={255}
                                aria-invalid={Boolean(errors.location)}
                                aria-describedby={
                                    errors.location
                                        ? "edit-location-error"
                                        : undefined
                                }
                                className={inputClass}
                            />

                            {errors.location && (
                                <p
                                    id="edit-location-error"
                                    className="mt-2 text-xs text-red-400"
                                >
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="edit-image"
                                className="mb-2 block text-sm font-medium"
                            >
                                Property image URL
                            </label>

                            <input
                                id="edit-image"
                                type="text"
                                value={imageUrl}
                                onChange={(event) =>
                                    setImageUrl(event.target.value)
                                }
                                maxLength={2000}
                                aria-invalid={Boolean(errors.imageUrl)}
                                aria-describedby={
                                    errors.imageUrl
                                        ? "edit-image-error"
                                        : undefined
                                }
                                className={inputClass}
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Use an existing /properties/ image
                                path or a public HTTPS image URL.
                            </p>

                            {errors.imageUrl && (
                                <p
                                    id="edit-image-error"
                                    className="mt-2 text-xs text-red-400"
                                >
                                    {errors.imageUrl}
                                </p>
                            )}
                        </div>

                        {serverError && (
                            <p
                                role="alert"
                                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                            >
                                {serverError}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded bg-green-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? "Saving..."
                                    : "Save changes →"}
                            </button>

                            <Link
                                to={`/properties/${id}`}
                                className="text-sm text-gray-400 transition-colors hover:text-white"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
