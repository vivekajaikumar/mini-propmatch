
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

export function Login() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await axios.post("/api/auth/login", {
                email,
                password,
            });

            // Update the logged-in user across React.
            await refreshUser();

            // Redirect to the homepage.
            navigate("/");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ??
                    "Unable to log in"
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
            <h1 className="mb-6 text-3xl font-bold">
                Welcome back
            </h1>

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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-2 block">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white"
                    />
                </div>

                {error && (
                    <p role="alert" className="text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>

            <p className="mt-6 text-center text-slate-400">
                Don't have an account?{" "}
                <Link
                    to="/signup"
                    className="text-emerald-400 hover:underline"
                >
                    Sign up
                </Link>
            </p>
        </main>
    );
}
