
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";

const signupSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z
        .string()
        .min(12, "Password must be at least 12 characters")
        .max(128, "Password must be at most 128 characters"),
});

export function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const parsed = signupSchema.safeParse({
            email: email.trim().toLowerCase(),
            password,
        });

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid input");
            return;
        }

        setLoading(true);

        try {
            await axios.post("/api/auth/signup", parsed.data);

            // Signup creates the account but does not log in.
            navigate("/login");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ??
                    "Unable to create account"
                );
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto mt-20 max-w-md px-4">
            <h1 className="mb-2 text-3xl font-bold">
                Create your account
            </h1>

            <p className="mb-8 text-slate-400">
                Join Mini PropMatch to list your properties.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="mb-2 block">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-2 block">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={12}
                        maxLength={128}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white"
                        placeholder="At least 12 characters"
                    />

                    <p className="mt-2 text-sm text-slate-400">
                        Use at least 12 characters.
                    </p>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-6 text-center text-slate-400">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-emerald-400 hover:underline"
                >
                    Log in
                </Link>
            </p>
        </main>
    );
}
