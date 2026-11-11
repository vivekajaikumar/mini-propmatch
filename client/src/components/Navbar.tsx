
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    async function handleLogout() {
        setLoggingOut(true);
        setLogoutError("");

        try {
            await logout();
            navigate("/");
        } catch {
            setLogoutError("Logout failed. Please try again.");
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <header className="border-b border-white/10">
            <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 border-x border-white/10 px-5 py-3 md:w-[85%] md:px-10 lg:px-16">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-3"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-green-500 text-lg font-bold text-black">
                        P
                    </span>

                    <span className="text-base font-bold tracking-wide">
                        PROPMATCH
                    </span>
                </Link>

                {/* Navigation */}
                <div className="flex flex-wrap items-center justify-end gap-3 md:gap-6">
                    <Link
                        to="/#properties"
                        className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        Properties
                    </Link>

                    <Link
                        to="/properties/new"
                        className="rounded border border-green-500/50 px-3 py-2 text-xs font-semibold text-green-400 transition-colors hover:border-green-400 hover:bg-green-500/10 md:px-4 md:text-sm"
                    >
                        + List Property
                    </Link>

                    <Link
                        to="/#properties"
                        className="hidden rounded bg-green-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-green-400 md:inline-flex md:text-sm"
                    >
                        Explore homes
                    </Link>

                    {/* Authentication */}
                    {!loading && (
                        user ? (
                            <>
                                <span
                                    className="hidden max-w-40 truncate text-xs text-gray-400 lg:inline"
                                    title={user.email}
                                >
                                    {user.email}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="rounded border border-white/20 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                >
                                    {loggingOut
                                        ? "Logging out..."
                                        : "Log out"}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-300 transition-colors hover:text-white"
                                >
                                    Log in
                                </Link>

                                <Link
                                    to="/signup"
                                    className="rounded bg-green-500 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-green-400 md:text-sm"
                                >
                                    Sign up
                                </Link>
                            </>
                        )
                    )}
                </div>
            </nav>

            {logoutError && (
                <p
                    role="alert"
                    className="px-5 pb-2 text-center text-sm text-red-400"
                >
                    {logoutError}
                </p>
            )}
        </header>
    );
}
